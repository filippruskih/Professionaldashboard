import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Unauthenticated on purpose (see src/proxy.ts) — external uptime monitors
// and Railway's own healthcheck can't present the SITE_PASSWORD. Pings the
// DB rather than just returning 200, so a stuck/unreachable database also
// shows up as unhealthy instead of the process merely being alive.
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[health] check failed", error);
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
