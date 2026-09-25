import { NextResponse } from "next/server";
import { generateAnalyticsExport } from "@/lib/export";

export async function GET() {
  const markdown = await generateAnalyticsExport();
  return NextResponse.json({ markdown });
}
