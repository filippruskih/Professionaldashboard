import { Bot } from "lucide-react";
import { db } from "@/lib/db";
import { ensureAgentDefinitions } from "@/lib/agents/runner";
import { AgentCard } from "@/components/agents/agent-card";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  await ensureAgentDefinitions();

  const definitions = await db.agentDefinition.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      runs: {
        orderBy: { startedAt: "desc" },
        take: 1,
        include: { logs: { orderBy: { timestamp: "asc" } } },
      },
    },
  });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        icon={Bot}
        color="orange"
        title="Agents"
        description="Analytics, Trend, Idea, Planning, and DM agents - live status and activity log."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {definitions.map((definition) => (
          <AgentCard
            key={definition.key}
            initial={{
              key: definition.key,
              name: definition.name,
              description: definition.description,
              schedule: definition.schedule,
              enabled: definition.enabled,
              runs: definition.runs.map((run) => ({
                id: run.id,
                status: run.status,
                startedAt: run.startedAt.toISOString(),
                finishedAt: run.finishedAt?.toISOString() ?? null,
                outputSummary: run.outputSummary,
                logs: run.logs.map((log) => ({
                  id: log.id,
                  timestamp: log.timestamp.toISOString(),
                  level: log.level,
                  message: log.message,
                })),
              })),
            }}
          />
        ))}
      </div>
    </div>
  );
}
