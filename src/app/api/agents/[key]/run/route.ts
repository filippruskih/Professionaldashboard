import { NextResponse } from "next/server";
import { AGENT_REGISTRY } from "@/lib/agents/registry";
import { triggerAgentRun } from "@/lib/agents/runner";

export async function POST(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;

  if (!AGENT_REGISTRY[key]) {
    return NextResponse.json({ error: "Unknown agent" }, { status: 404 });
  }

  try {
    const runId = await triggerAgentRun(key);
    return NextResponse.json({ runId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to start run";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
