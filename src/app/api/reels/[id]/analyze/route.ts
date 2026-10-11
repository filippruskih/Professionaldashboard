import { NextResponse } from "next/server";
import { getCurrentUserId, unauthorized } from "@/lib/session";
import { analyzeReelPerformance } from "@/lib/agents/tasks/reel-performance";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const { id } = await params;

  try {
    const analysis = await analyzeReelPerformance(userId, id);
    return NextResponse.json({ analysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
