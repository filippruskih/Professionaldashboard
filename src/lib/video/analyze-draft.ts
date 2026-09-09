import { db } from "@/lib/db";
import { anthropic, requireAnthropicKey, AGENT_MODEL } from "@/lib/anthropic";
import { extractFrames } from "@/lib/video/frames";
import { draftFileExists } from "@/lib/video/draft-storage";
import type Anthropic from "@anthropic-ai/sdk";

const ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    breakdown: {
      type: "array",
      // No minItems/maxItems — Claude's structured-output schema only
      // allows 0 or 1 there (see planning.ts); the prompt asks for a
      // reasonable count instead.
      items: {
        type: "object",
        properties: {
          area: {
            type: "string",
            description: "Short label for what this note is about, e.g. \"0-2s hook\", \"pacing\", \"text overlay\"",
          },
          suggestion: {
            type: "string",
            description: "A concrete, specific change or addition — not generic advice",
          },
        },
        required: ["area", "suggestion"],
        additionalProperties: false,
      },
    },
    hook: {
      type: "string",
      description: "A recommended spoken/on-screen hook for the first 1-2 seconds",
    },
    caption: {
      type: "string",
      description: "A ready-to-post Instagram caption (not closed captions/subtitles)",
    },
  },
  required: ["breakdown", "hook", "caption"],
  additionalProperties: false,
};

interface DraftAnalysis {
  breakdown: { area: string; suggestion: string }[];
  hook: string;
  caption: string;
}

async function getGroundingContext(): Promise<string> {
  const [trendRun, dnaProfile] = await Promise.all([
    db.agentRun.findFirst({
      where: { agent: { key: "trend" }, status: "succeeded" },
      orderBy: { startedAt: "desc" },
    }),
    db.contentDnaProfile.findFirst({ orderBy: { generatedAt: "desc" } }),
  ]);

  const parts: string[] = [];
  if (trendRun?.outputSummary) {
    parts.push(`Current trend research for this creator's niche:\n${trendRun.outputSummary}`);
  }
  if (dnaProfile?.narrative) {
    parts.push(`This creator's Content DNA (what consistently works for them):\n${dnaProfile.narrative}`);
  }
  return parts.length > 0
    ? parts.join("\n\n")
    : "No trend research or Content DNA profile available yet — analyze on the reel's own merits.";
}

// Runs in the background after upload (see src/app/api/drafts/route.ts).
// This process is a long-lived Next.js server, not serverless, so
// execution continues after the upload request has already responded.
export async function processDraftReel(draftId: string): Promise<void> {
  const draft = await db.draftReel.findUnique({ where: { id: draftId } });
  if (!draft) return;

  try {
    if (!(await draftFileExists(draft.storagePath))) {
      throw new Error("Uploaded file went missing before analysis could run");
    }

    await db.draftReel.update({ where: { id: draftId }, data: { status: "processing" } });

    const [frames, grounding] = await Promise.all([
      extractFrames(draft.storagePath),
      getGroundingContext(),
    ]);

    if (frames.length === 0) {
      throw new Error("Couldn't extract any frames from this video");
    }

    requireAnthropicKey();

    const imageBlocks: Anthropic.ContentBlockParam[] = frames.flatMap((frame) => [
      { type: "text", text: `Frame at ~${frame.timestampSeconds}s:` },
      {
        type: "image",
        source: { type: "base64", media_type: "image/jpeg", data: frame.base64 },
      },
    ]);

    const response = await anthropic.messages.create({
      model: AGENT_MODEL,
      max_tokens: 2000,
      thinking: { type: "disabled" },
      output_config: { format: { type: "json_schema", schema: ANALYSIS_SCHEMA } },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `The following are ${frames.length} evenly-spaced frames sampled from an in-progress Instagram Reel this creator hasn't posted yet, in chronological order. There is no audio/transcript — analyze the visuals only.\n\n${grounding}`,
            },
            ...imageBlocks,
            {
              type: "text",
              text: `Give frame-by-frame, concrete feedback on this draft before it gets posted: what to change, cut, or add (pacing, framing, text overlays, hook strength, visual variety, etc.), referencing specific frames/timestamps where useful. Compare it against the trend research and Content DNA above — call out where it already matches a working pattern and where it doesn't. Then give one recommended hook (first 1-2 seconds) and one ready-to-post Instagram caption. The caption is the post caption, not closed captions/subtitles.`,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Analysis response had no text content");
    }
    const analysis = JSON.parse(textBlock.text) as DraftAnalysis;

    await db.draftReel.update({
      where: { id: draftId },
      data: { status: "analyzed", analysisJson: JSON.stringify(analysis), error: null },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db.draftReel.update({
      where: { id: draftId },
      data: { status: "failed", error: message },
    });
  }
}
