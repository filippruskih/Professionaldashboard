import { db } from "@/lib/db";
import { anthropic, requireAnthropicKey, AGENT_MODEL, NO_EM_DASH_INSTRUCTION } from "@/lib/anthropic";
import type { AgentContext } from "@/lib/agents/registry";
import { AgentSkip } from "@/lib/agents/errors";

const CATEGORIES = ["question", "collab", "fan", "spam", "business", "other"] as const;

const DRAFT_SCHEMA = {
  type: "object",
  properties: {
    category: { type: "string", enum: CATEGORIES as unknown as string[] },
    draftReply: {
      type: "string",
      description:
        "A natural, first-person reply the creator can review and send themselves. Empty string if this thread doesn't warrant a reply (e.g. spam).",
    },
  },
  required: ["category", "draftReply"],
  additionalProperties: false,
};

const MAX_THREADS_PER_RUN = 10;

export async function runDmAgent(ctx: AgentContext): Promise<string> {
  await ctx.log("Looking for DM threads that need a draft reply…");

  const threads = await db.dmThread.findMany({
    where: { draftStatus: "none" },
    orderBy: { lastMessageAt: "desc" },
    take: MAX_THREADS_PER_RUN,
    include: { messages: { orderBy: { sentAt: "asc" } } },
  });

  const threadsWithIncoming = threads.filter((t) => t.messages.some((m) => m.fromUser));

  if (threadsWithIncoming.length === 0) {
    await ctx.log(
      "No new DM threads to draft replies for. (This requires the Instagram Messaging webhook to be receiving messages - see the DM Manager page.)",
      "warn"
    );
    throw new AgentSkip("Skipped: no DM threads awaiting a reply");
  }

  requireAnthropicKey();
  let drafted = 0;

  for (const thread of threadsWithIncoming) {
    const conversation = thread.messages
      .map((m) => `${m.fromUser ? "Them" : "You"}: ${m.text ?? "(no text)"}`)
      .join("\n");

    const response = await anthropic.messages.create({
      model: AGENT_MODEL,
      max_tokens: 400,
      thinking: { type: "disabled" },
      output_config: { format: { type: "json_schema", schema: DRAFT_SCHEMA } },
      messages: [
        {
          role: "user",
          content: `Here is an Instagram DM conversation for a content creator's account:\n\n${conversation}\n\nCategorize this thread and, if it warrants a reply, draft a natural, friendly, first-person reply the creator can review and send themselves. Never draft a reply that claims to be automated or that commits to anything the creator hasn't said - keep it short and in their voice. If this looks like spam or doesn't need a reply, set draftReply to an empty string.\n\n${NO_EM_DASH_INSTRUCTION}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") continue;
    const result = JSON.parse(textBlock.text) as { category: string; draftReply: string };

    await db.dmThread.update({
      where: { id: thread.id },
      data: {
        category: result.category,
        draftReply: result.draftReply || null,
        draftStatus: result.draftReply ? "drafted" : "dismissed",
      },
    });

    drafted += 1;
    await ctx.log(
      `"${thread.participantUsername ?? thread.igThreadId}" → ${result.category}${
        result.draftReply ? " (draft ready)" : " (no reply needed)"
      }`
    );
  }

  return `Drafted replies for ${drafted} thread${drafted === 1 ? "" : "s"}`;
}
