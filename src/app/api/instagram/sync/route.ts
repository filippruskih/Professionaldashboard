import { NextResponse } from "next/server";
import { runInstagramSync } from "@/lib/instagram/sync";

export async function POST() {
  try {
    const result = await runInstagramSync();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
