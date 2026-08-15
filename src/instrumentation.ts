export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startScheduler } = await import("@/lib/agents/scheduler");
    await startScheduler();

    // Railway sends SIGTERM on every redeploy/restart. Close the DB pool
    // deliberately instead of letting the process die mid-connection —
    // cheap insurance against connection errors on the next deploy.
    const { db } = await import("@/lib/db");
    const shutdown = async () => {
      console.log("[shutdown] closing database connections...");
      await db.$disconnect();
      process.exit(0);
    };
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  }
}
