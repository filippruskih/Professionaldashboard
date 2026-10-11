import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAgentSettings } from "@/lib/agent-settings";
import { getCurrentUserId, unauthorized } from "@/lib/session";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const settings = await getAgentSettings(userId);
  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const body = await request.json();
  if (typeof body.excludedTopics !== "string") {
    return NextResponse.json({ error: "excludedTopics must be a string" }, { status: 400 });
  }

  const settings = await db.agentSettings.upsert({
    where: { userId },
    create: { userId, excludedTopics: body.excludedTopics },
    update: { excludedTopics: body.excludedTopics },
  });

  return NextResponse.json(settings);
}
