import { runSyncAgent } from "./tasks/sync";
import { runAnalyticsAgent } from "./tasks/analytics";
import { runTrendAgent } from "./tasks/trend";
import { runIdeaAgent } from "./tasks/idea";
import { runPlanningAgent } from "./tasks/planning";
import { runDmAgent } from "./tasks/dm";

export interface AgentContext {
  runId: string;
  log: (message: string, level?: "info" | "warn" | "error") => Promise<void>;
}

export interface AgentDefinitionConfig {
  key: string;
  name: string;
  description: string;
  schedule: string;
  enabledByDefault: boolean;
  run: (ctx: AgentContext) => Promise<string>;
}

export const AGENT_REGISTRY: Record<string, AgentDefinitionConfig> = {
  sync: {
    key: "sync",
    name: "Instagram sync",
    description:
      "Pulls your latest reels, posts, and follower count from Instagram automatically, every day.",
    schedule: "50 5 * * *",
    enabledByDefault: true,
    run: runSyncAgent,
  },
  analytics: {
    key: "analytics",
    name: "Analytics",
    description:
      "Crunches your reel performance daily, flags anomalies, and updates your Content DNA profile.",
    schedule: "0 6 * * *",
    enabledByDefault: true,
    run: runAnalyticsAgent,
  },
  trend: {
    key: "trend",
    name: "Trend scanner",
    description: "Researches current trends in your niche using web search.",
    schedule: "10 6 * * *",
    enabledByDefault: true,
    run: runTrendAgent,
  },
  idea: {
    key: "idea",
    name: "Idea creation",
    description: "Generates video ideas from current trends and your Content DNA.",
    schedule: "20 6 * * *",
    enabledByDefault: true,
    run: runIdeaAgent,
  },
  planning: {
    key: "planning",
    name: "Planning",
    description: "Turns the best idea into today's concrete hook and script.",
    schedule: "30 6 * * *",
    enabledByDefault: true,
    run: runPlanningAgent,
  },
  dm: {
    key: "dm",
    name: "DM manager",
    description:
      "Categorizes Instagram DMs and drafts suggested replies for you to review — never sends automatically.",
    schedule: "*/15 * * * *",
    enabledByDefault: false,
    run: runDmAgent,
  },
};
