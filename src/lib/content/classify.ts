import { anthropic, CLASSIFY_MODEL } from "@/lib/anthropic";

export const REEL_FORMATS = [
  "talking_head",
  "story_time",
  "workout",
  "tutorial",
  "other",
] as const;

export type ReelFormat = (typeof REEL_FORMATS)[number];

const FORMAT_LABELS: Record<string, string> = {
  talking_head: "Talking head",
  story_time: "Story time",
  workout: "Workout",
  tutorial: "Tutorial",
  other: "Other",
};

export function formatLabel(format: string): string {
  return FORMAT_LABELS[format] ?? format;
}

export interface ReelClassification {
  format: ReelFormat;
  topics: string[];
}

const CLASSIFY_SCHEMA = {
  type: "object",
  properties: {
    format: { type: "string", enum: REEL_FORMATS as unknown as string[] },
    topics: {
      type: "array",
      items: { type: "string" },
      description: "1-4 short topic tags, e.g. 'morning routine', 'mindset'",
    },
  },
  required: ["format", "topics"],
  additionalProperties: false,
};

export async function classifyReel(caption: string | null): Promise<ReelClassification> {
  const response = await anthropic.messages.create({
    model: CLASSIFY_MODEL,
    max_tokens: 300,
    output_config: {
      format: { type: "json_schema", schema: CLASSIFY_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: `Classify this Instagram Reel caption by content format and topic tags.\n\nCaption: ${
          caption ?? "(no caption)"
        }`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Classification response had no text content");
  }

  const parsed = JSON.parse(textBlock.text) as ReelClassification;
  return parsed;
}

const TOPICS_SCHEMA = {
  type: "object",
  properties: {
    topics: {
      type: "array",
      items: { type: "string" },
      description: "1-4 short topic tags, e.g. 'morning routine', 'mindset'",
    },
  },
  required: ["topics"],
  additionalProperties: false,
};

// Lighter version of classifyReel for Posts (photos/carousels) — topics
// only, no format enum, since mediaType already captures "format" for
// non-video content.
export async function classifyTopics(caption: string | null): Promise<string[]> {
  const response = await anthropic.messages.create({
    model: CLASSIFY_MODEL,
    max_tokens: 200,
    output_config: {
      format: { type: "json_schema", schema: TOPICS_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: `Extract 1-4 short topic tags for this Instagram post caption.\n\nCaption: ${
          caption ?? "(no caption)"
        }`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Classification response had no text content");
  }

  const parsed = JSON.parse(textBlock.text) as { topics: string[] };
  return parsed.topics;
}
