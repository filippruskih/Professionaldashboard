"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Loader2,
  MessageCircle,
  Play,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBadge, type IconBadgeColor } from "@/components/icon-badge";
import { cn } from "@/lib/utils";

// Same fixed categorical order as the rest of the app — each agent keeps
// its color identity everywhere it's shown.
const AGENT_ICONS: Record<string, { icon: typeof BarChart3; color: IconBadgeColor }> = {
  analytics: { icon: BarChart3, color: "blue" },
  trend: { icon: TrendingUp, color: "orange" },
  idea: { icon: Lightbulb, color: "aqua" },
  planning: { icon: CalendarClock, color: "yellow" },
  dm: { icon: MessageCircle, color: "magenta" },
};

interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  message: string;
}

interface RunSummary {
  id: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  outputSummary: string | null;
  logs: LogEntry[];
}

interface AgentData {
  key: string;
  name: string;
  description: string;
  schedule: string;
  enabled: boolean;
  runs: RunSummary[];
}

const POLL_INTERVAL_MS = 1500;

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <Badge variant="outline">Never run</Badge>;
  if (status === "running") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Loader2 className="size-3 animate-spin" /> Running
      </Badge>
    );
  }
  if (status === "succeeded")
    return (
      <Badge variant="secondary" className="text-delta-good gap-1">
        <CheckCircle2 className="size-3" /> Succeeded
      </Badge>
    );
  if (status === "failed")
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="size-3" /> Failed
      </Badge>
    );
  return <Badge variant="outline">Skipped</Badge>;
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function AgentCard({ initial }: { initial: AgentData }) {
  const [agent, setAgent] = useState(initial);
  const [expanded, setExpanded] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const latestRun = agent.runs[0] ?? null;
  const isRunning = latestRun?.status === "running";

  async function refresh() {
    const res = await fetch(`/api/agents/${agent.key}`, { cache: "no-store" });
    if (res.ok) setAgent(await res.json());
  }

  useEffect(() => {
    if (isRunning && !pollRef.current) {
      pollRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    }
    if (!isRunning && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  async function handleRunNow() {
    setTriggering(true);
    setExpanded(true);
    try {
      await fetch(`/api/agents/${agent.key}/run`, { method: "POST" });
      await refresh();
    } finally {
      setTriggering(false);
    }
  }

  const { icon, color } = AGENT_ICONS[agent.key] ?? { icon: BarChart3, color: "blue" };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <IconBadge icon={icon} color={color} />
            <div>
              <CardTitle className="text-base">{agent.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{agent.description}</p>
            </div>
          </div>
          <StatusBadge status={latestRun?.status ?? null} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {latestRun
              ? `Last run ${relativeTime(latestRun.startedAt)}`
              : agent.enabled
                ? "Not run yet"
                : "Disabled"}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setExpanded((v) => !v)}>
              {expanded ? <ChevronUp /> : <ChevronDown />}
              Log
            </Button>
            <Button size="sm" onClick={handleRunNow} disabled={triggering || isRunning}>
              <Play />
              Run now
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="max-h-64 overflow-y-auto rounded-md border bg-muted/30 p-3 font-mono text-xs">
            {latestRun && latestRun.logs.length > 0 ? (
              latestRun.logs.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    "flex gap-2",
                    entry.level === "error" && "text-destructive",
                    entry.level === "warn" && "text-amber-600 dark:text-amber-400"
                  )}
                >
                  <span className="shrink-0 text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                  <span>{entry.message}</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No log entries yet.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
