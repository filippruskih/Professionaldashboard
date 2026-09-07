import { db } from "@/lib/db";
import { anthropic, requireAnthropicKey, AGENT_MODEL } from "@/lib/anthropic";
import type { AgentContext } from "@/lib/agents/registry";
import { AgentSkip } from "@/lib/agents/errors";

const PLAN_SCHEMA = {
  type: "object",
  properties: {
    plans: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
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
      },
    },
  },
  required: ["plans"],
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
  await ctx.log("Turning today's ideas into 3 ready-to-film hook + script options…");

  const response = await anthropic.messages.create({
    model: AGENT_MODEL,
    max_tokens: 1600,
    thinking: { type: "disabled" },
    output_config: { format: { type: "json_schema", schema: PLAN_SCHEMA } },
    messages: [
      {
        role: "user",
        content: `Here are candidate video ideas for a creator's next Instagram Reel:\n\n${ideaRun.outputSummary}\n\nPick the 3 strongest, most distinct ideas from these candidates (or close variations of them) and turn each into its own concrete, ready-to-film hook and script for today. Give the creator genuine variety to choose from — not three versions of the same idea.`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Planning response had no text content");
  }
  const { plans } = JSON.parse(textBlock.text) as {
    plans: { hook: string; script: string }[];
  };

  if (plans.length === 0) {
    throw new Error("Planning response had no plans");
  }

  await db.suggestion.createMany({
    data: plans.map((plan) => ({
      hook: plan.hook,
      script: plan.script,
      sourceAgentRunId: ideaRun.id,
      status: "new",
    })),
  });

  await ctx.log(`${plans.length} options ready, starting with: "${plans[0].hook}"`);

  return `${plans.length} hook/script options ready — starting with: "${plans[0].hook}"`;
}
