import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionCookie } from "@/lib/auth";

// For Server Components and Route Handlers (Node runtime) - proxy.ts
// verifies the same cookie independently via NextRequest, since it can't
// use next/headers. Both checks exist on purpose: Next's own guidance is
// to verify auth inside every route rather than relying on Proxy alone,
// since a matcher change can silently drop a route from Proxy coverage.
export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return verifySessionCookie(cookieStore.get(SESSION_COOKIE)?.value);
}

// For pages that have no meaningful "logged out" state to render.
export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  return userId;
}

export function unauthorized() {
  return NextResponse.json({ error: "Authentication required" }, { status: 401 });
}

// Returned for a record that exists but belongs to someone else, exactly
// as if it didn't exist at all - a distinct "forbidden" response would
// confirm to the caller that the id is real.
export function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
