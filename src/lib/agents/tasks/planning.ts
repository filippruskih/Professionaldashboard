import { db } from "@/lib/db";
import { anthropic, requireAnthropicKey, AGENT_MODEL } from "@/lib/anthropic";
import type { AgentContext } from "@/lib/agents/registry";
import { AgentSkip } from "@/lib/agents/errors";

const PLAN_SCHEMA = {
  type: "object",
  properties: {
    hook: {
      type: "string",
      description: "A punchy opening line for the reel, spoken in the first 1-2 seconds",
    },
    script: {
      type: "string",
      description: "A concise beat-by-beat script or outline for the full reel",
    },
  },
  required: ["hook", "script"],
  additionalProperties: false,
};

export async function runPlanningAgent(ctx: AgentContext): Promise<string> {
  await ctx.log("Reading the latest ideas…");
  const ideaRun = await db.agentRun.findFirst({
    where: { agent: { key: "idea" }, status: "succeeded" },
    orderBy: { startedAt: "desc" },
  });

  if (!ideaRun?.outputSummary) {
    await ctx.log("No ideas available yet — run the Idea agent first.", "warn");
    throw new AgentSkip("Skipped: no ideas to plan from yet");
  }

  requireAnthropicKey();
  await ctx.log("Picking today's idea and writing the hook + script…");

  const response = await anthropic.messages.create({
    model: AGENT_MODEL,
    max_tokens: 800,
    thinking: { type: "disabled" },
    output_config: { format: { type: "json_schema", schema: PLAN_SCHEMA } },
    messages: [
      {
        role: "user",
        content: `Here are candidate video ideas for a creator's next Instagram Reel:\n\n${ideaRun.outputSummary}\n\nPick the single strongest idea and turn it into a concrete, ready-to-film hook and script for today.`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Planning response had no text content");
  }
  const plan = JSON.parse(textBlock.text) as { hook: string; script: string };

  await db.suggestion.create({
    data: {
      hook: plan.hook,
      script: plan.script,
      sourceAgentRunId: ideaRun.id,
      status: "new",
    },
  });

  await ctx.log(`Today's suggestion: "${plan.hook}"`);

  return `Today's hook: "${plan.hook}"`;
}
