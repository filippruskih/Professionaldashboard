import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Unauthenticated on purpose (see src/proxy.ts) — external uptime monitors
// and Railway's own healthcheck can't log in. Pings the DB rather than
// just returning 200, so a stuck/unreachable database also shows up as
// unhealthy instead of the process merely being alive.
//
// Deliberately says nothing about any user's Instagram connection: with
// multiple accounts, one user's expired token isn't the service being
// down, and failing this endpoint over it would get the whole deployment
// marked unhealthy. Token expiry is surfaced per user on Profile instead.
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", database: "ok" });
  } catch (error) {
    console.error("[health] check failed", error);
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
