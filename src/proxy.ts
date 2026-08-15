import { NextResponse, type NextRequest } from "next/server";

// Gates the whole app behind a single shared password once hosted publicly.
// Only active when SITE_PASSWORD is set — local dev stays open by default.
// A few routes are excluded:
// - The Instagram webhook: Meta calls it server-to-server with no browser
//   session, and it already verifies requests itself (HMAC signature on
//   POST, hub.verify_token on the GET handshake) — see
//   src/app/api/instagram/webhook/route.ts.
// - /api/health: external uptime monitors and Railway's own healthcheck
//   can't present credentials either.
// - /privacy and /terms: must be publicly readable — Meta's App Review
//   requires the Privacy Policy URL to load with no login, and future
//   subscribers need to read them before signing up.

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Creator Dashboard"' },
  });
}

// Brute-force lockout. In-memory is fine here (not a distributed rate
// limiter) because Railway runs this as one long-lived Node process, not
// serverless functions that reset state between requests — it just resets
// on redeploy, which is an acceptable tradeoff for a personal single-user
// app rather than pulling in Redis for this.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;

interface AttemptRecord {
  count: number;
  windowStart: number;
  lockedUntil: number | null;
}

const attempts = new Map<string, AttemptRecord>();

function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function isLocked(ip: string): boolean {
  const record = attempts.get(ip);
  if (!record?.lockedUntil) return false;
  if (Date.now() > record.lockedUntil) {
    attempts.delete(ip);
    return false;
  }
  return true;
}

function recordFailure(ip: string) {
  const now = Date.now();
  const record = attempts.get(ip);
  if (!record || now - record.windowStart > WINDOW_MS) {
    attempts.set(ip, { count: 1, windowStart: now, lockedUntil: null });
    return;
  }
  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
  }
}

export function proxy(request: NextRequest) {
  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword) return NextResponse.next();

  const ip = clientIp(request);
  if (isLocked(ip)) {
    return new NextResponse("Too many failed attempts. Try again later.", { status: 429 });
  }

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return unauthorized();

  const decoded = atob(header.slice("Basic ".length));
  const password = decoded.slice(decoded.indexOf(":") + 1);
  if (password !== sitePassword) {
    recordFailure(ip);
    return unauthorized();
  }

  attempts.delete(ip);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/instagram/webhook|api/health|privacy|terms|_next/static|_next/image|favicon.ico).*)",
  ],
};
