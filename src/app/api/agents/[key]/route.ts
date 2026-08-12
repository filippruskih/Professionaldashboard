import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureAgentDefinitions } from "@/lib/agents/runner";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  await ensureAgentDefinitions();

  const definition = await db.agentDefinition.findUnique({
    where: { key },
    include: {
      runs: {
        orderBy: { startedAt: "desc" },
        take: 5,
        include: { logs: { orderBy: { timestamp: "asc" } } },
      },
    },
  });

  if (!definition) {
    return NextResponse.json({ error: "Unknown agent" }, { status: 404 });
  }

  return NextResponse.json(definition);
}
