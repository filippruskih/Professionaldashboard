import { db } from "@/lib/db";
import { anthropic, requireAnthropicKey, AGENT_MODEL, NO_EM_DASH_INSTRUCTION } from "@/lib/anthropic";
import type { AgentContext } from "@/lib/agents/registry";
import { AgentSkip } from "@/lib/agents/errors";

async function getNicheContext(): Promise<string | null> {
  const reels = await db.reel.findMany({
    orderBy: { postedAt: "desc" },
    take: 15,
    select: { caption: true, topicTags: true, format: true },
  });
  if (reels.length === 0) return null;

  const lines = reels.map((r) => {
    const topics: string[] = r.topicTags ? JSON.parse(r.topicTags) : [];
    return `- ${r.caption ?? "(no caption)"}${topics.length ? ` [${topics.join(", ")}]` : ""}`;
  });
  return lines.join("\n");
}

export async function runTrendAgent(ctx: AgentContext): Promise<string> {
  await ctx.log("Looking at your recent content to infer your niche…");
  const nicheContext = await getNicheContext();

  if (!nicheContext) {
    await ctx.log("No reels synced yet - can't infer a niche to research trends for.", "warn");
    throw new AgentSkip("Skipped: no content history yet");
  }

  requireAnthropicKey();
  await ctx.log("Searching the web for current trends in your niche…");

  const response = await anthropic.messages.create({
    model: AGENT_MODEL,
    max_tokens: 1200,
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 5 }],
    messages: [
      {
        role: "user",
        content: `Here are captions and topic tags from this creator's recent Instagram Reels:\n\n${nicheContext}\n\nBased on this, infer their content niche in one short phrase, then research current (this week/month) trends, formats, sounds, or topics gaining traction in that niche on Instagram/TikTok. Search the web for real, current information - don't rely on prior knowledge alone. Output: a one-line niche identification, followed by 3-5 trends as a short bulleted list, each with a one-sentence "why it's working" note. Keep the whole thing under 250 words.\n\n${NO_EM_DASH_INSTRUCTION}`,
      },
    ],
  });

  const textBlocks = response.content.filter((b) => b.type === "text");
  const summary = textBlocks.map((b) => (b.type === "text" ? b.text : "")).join("\n").trim();

  const searchCount = response.content.filter((b) => b.type === "web_search_tool_result").length;
  await ctx.log(`Ran ${searchCount} web search${searchCount === 1 ? "" : "es"}.`);
  await ctx.log("Trend research ready.");

  return summary || "No trends found.";
}
