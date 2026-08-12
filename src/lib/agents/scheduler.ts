import cron from "node-cron";
import { AGENT_REGISTRY } from "./registry";
import { ensureAgentDefinitions, triggerAgentRun } from "./runner";

let started = false;

// Called once from instrumentation.ts when the server boots. Agents only
// run while this process is up — there's no separate worker.
export async function startScheduler() {
  if (started) return;
  started = true;

  await ensureAgentDefinitions();

  for (const config of Object.values(AGENT_REGISTRY)) {
    cron.schedule(config.schedule, () => {
      triggerAgentRun(config.key).catch((error) => {
        console.error(`[agents] scheduled run for ${config.key} failed to start`, error);
      });
    });
  }

  console.log(
    `[agents] scheduler started (${Object.keys(AGENT_REGISTRY).length} agents registered)`
  );
}
