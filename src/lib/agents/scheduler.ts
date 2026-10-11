import cron from "node-cron";
import { db } from "@/lib/db";
import { ensureAgentDefinitions, triggerAgentRun } from "./runner";
import { AGENT_REGISTRY } from "./registry";
import type { AgentDefinition } from "@/generated/prisma/client";

let started = false;

const POLL_SCHEDULE = "*/5 * * * *"; // every 5 minutes

// Start of the current period, in UTC - "has this agent already run since
// then?" is how we avoid re-triggering every 5 minutes throughout the
// matching hour, without needing a separate "last fired at" column.
function periodStart(now: Date, def: AgentDefinition): Date | null {
  if (def.frequency === "daily") {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }
  if (def.frequency === "weekly") {
    const daysSinceTarget = (now.getUTCDay() - def.dayOfWeek + 7) % 7;
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    start.setUTCDate(start.getUTCDate() - daysSinceTarget);
    return start;
  }
  if (def.frequency === "monthly") {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }
  return null; // "off"
}

// Poll ticks land on :00/:05/:10 etc, so "due" means the tick closest to
// the target minute, not an exact match - a straight equality check would
// skip a target minute that falls between two ticks (e.g. a stale value
// saved before 5-minute snapping was enforced client-side).
const POLL_INTERVAL_MINUTES = 5;

function isDue(now: Date, def: AgentDefinition): boolean {
  if (def.frequency === "off") return false;
  if (now.getUTCHours() !== def.hour) return false;
  if (Math.abs(now.getUTCMinutes() - def.minute) >= POLL_INTERVAL_MINUTES) return false;
  if (def.frequency === "weekly" && now.getUTCDay() !== def.dayOfWeek) return false;
  if (def.frequency === "monthly" && now.getUTCDate() !== def.dayOfMonth) return false;
  return true;
}

// Agent definitions are otherwise only created lazily (first visit to the
// Agents page, or a manual "Run now"), so a user who connected Instagram
// but never opened that page would never get anything scheduled. Only
// users with a connected account count - there's nothing for any agent
// to do before that.
async function ensureDefinitionsForConnectedUsers() {
  const expected = Object.keys(AGENT_REGISTRY).length;
  const users = await db.user.findMany({
    where: { account: { isNot: null } },
    select: { id: true, _count: { select: { agentDefinitions: true } } },
  });
  for (const user of users) {
    if (user._count.agentDefinitions < expected) await ensureAgentDefinitions(user.id);
  }
}

async function checkDueAgents() {
  const now = new Date();
  await ensureDefinitionsForConnectedUsers();

  // Deliberately unscoped by user - this is the one system-level process
  // that iterates every user's schedule. Each run is then triggered with
  // its own definition's userId, so the task itself stays user-scoped.
  const definitions = await db.agentDefinition.findMany({
    where: { user: { account: { isNot: null } } },
    include: { runs: { orderBy: { startedAt: "desc" }, take: 1 } },
  });

  for (const def of definitions) {
    if (!isDue(now, def)) continue;

    const start = periodStart(now, def);
    const lastRun = def.runs[0];
    if (start && lastRun && lastRun.startedAt >= start) continue; // already fired this period

    triggerAgentRun(def.userId, def.key).catch((error) => {
      console.error(`[agents] scheduled run for ${def.key} (user ${def.userId}) failed to start`, error);
    });
  }
}

// Called once from instrumentation.ts when the server boots. Agents only
// run while this process is up - there's no separate worker. A single
// polling job (rather than one node-cron task per agent bound to a fixed
// expression at boot) is what lets frequency/hour changes made from the
// UI take effect immediately instead of requiring a redeploy.
export async function startScheduler() {
  if (started) return;
  started = true;

  cron.schedule(POLL_SCHEDULE, () => {
    checkDueAgents().catch((error) => {
      console.error("[agents] scheduler poll failed", error);
    });
  });

  console.log("[agents] scheduler started (polling every 5 minutes)");
}
