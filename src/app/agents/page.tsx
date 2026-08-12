import { Bot } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default function AgentsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Agents</h1>
        <p className="text-sm text-muted-foreground">
          Analytics, Trend, Idea, Planning, and DM agents — live status and activity log.
        </p>
      </div>
      <EmptyState
        icon={Bot}
        title="Agents not set up yet"
        description="The agent framework and daily agents are built in a later phase. Once live, each agent's status and log will be visible here in real time."
      />
    </div>
  );
}
