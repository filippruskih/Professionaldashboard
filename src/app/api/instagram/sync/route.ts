import { NextResponse } from "next/server";
import { runInstagramSync } from "@/lib/instagram/sync";
import { getCurrentUserId, unauthorized } from "@/lib/session";

export async function POST() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  try {
    const result = await runInstagramSync(userId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
