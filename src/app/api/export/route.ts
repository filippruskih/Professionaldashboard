import { NextResponse } from "next/server";
import { generateAnalyticsExport } from "@/lib/export";
import { getCurrentUserId, unauthorized } from "@/lib/session";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const markdown = await generateAnalyticsExport(userId);
  return NextResponse.json({ markdown });
}
