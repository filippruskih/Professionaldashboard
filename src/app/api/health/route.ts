import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Unauthenticated on purpose (see src/proxy.ts) — external uptime monitors
// and Railway's own healthcheck can't present the SITE_PASSWORD. Pings the
// DB rather than just returning 200, so a stuck/unreachable database also
// shows up as unhealthy instead of the process merely being alive.
//
// Also surfaces Instagram token expiry: sync.ts already auto-refreshes the
// long-lived token whenever it runs, but if sync ever stops running (a
// crashed scheduler, the app down for a while) the token can silently
// expire with nothing to notice until every Instagram-dependent feature
// breaks. Failing this endpoint once it's actually expired means the
// uptime monitor catches that instead of it going unnoticed.
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;

    const account = await db.account.findFirst();
    const tokenExpiresInDays = account
      ? Math.floor((account.tokenExpiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      : null;
    const tokenExpired = tokenExpiresInDays != null && tokenExpiresInDays < 0;

    return NextResponse.json(
      { status: tokenExpired ? "degraded" : "ok", database: "ok", tokenExpiresInDays },
      { status: tokenExpired ? 503 : 200 }
    );
  } catch (error) {
    console.error("[health] check failed", error);
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
