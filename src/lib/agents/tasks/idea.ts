import { db } from "@/lib/db";
import { anthropic, requireAnthropicKey, AGENT_MODEL } from "@/lib/anthropic";
import type { AgentContext } from "@/lib/agents/registry";
import { AgentSkip } from "@/lib/agents/errors";

async function getLatestAgentOutput(key: string): Promise<string | null> {
  const run = await db.agentRun.findFirst({
    where: { agent: { key }, status: "succeeded" },
    orderBy: { startedAt: "desc" },
  });
  return run?.outputSummary ?? null;
}

async function getRecentCaptions(): Promise<string[]> {
  const reels = await db.reel.findMany({
    orderBy: { postedAt: "desc" },
    take: 10,
    select: { caption: true },
  });
  return reels.map((r) => r.caption).filter((c): c is string => !!c);
}

export async function runIdeaAgent(ctx: AgentContext): Promise<string> {
  await ctx.log("Reading the latest trend research…");
  const trends = await getLatestAgentOutput("trend");

  if (!trends) {
    await ctx.log(
      "No trend research available yet — run the Trend agent first for grounded ideas.",
      "warn"
    );
    throw new AgentSkip("Skipped: no trend research to build on yet");
  }

  const dnaProfile = await db.contentDnaProfile.findFirst({ orderBy: { generatedAt: "desc" } });
  const dna = dnaProfile?.narrative ?? null;
  const recentCaptions = await getRecentCaptions();

  requireAnthropicKey();
  await ctx.log("Generating video ideas…");

  const response = await anthropic.messages.create({
    model: AGENT_MODEL,
    max_tokens: 800,
    thinking: { type: "disabled" },
    messages: [
      {
        role: "user",
        content: `You are the idea-generation agent for a creator's Instagram Reels dashboard.

Current trend research:
${trends}

${dna ? `This creator's Content DNA (what has historically worked for them):\n${dna}\n` : ""}
Reels they've already posted recently (don't repeat these):
${recentCaptions.map((c) => `- ${c}`).join("\n") || "(none yet)"}

Generate 3 concrete, specific video ideas for their next reel, grounded in the trend research above and (if given) their Content DNA. For each idea give: a one-line concept, and why it fits both the trend and their niche. Keep it under 300 words total.`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const ideas = textBlock && textBlock.type === "text" ? textBlock.text.trim() : "";
  await ctx.log("Ideas ready.");

  return ideas || "No ideas generated.";
}
