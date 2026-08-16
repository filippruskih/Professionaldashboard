import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, isValidSession } from "@/lib/auth";

// Gates the whole app behind a single shared password once hosted publicly.
// Only active when SITE_PASSWORD is set — local dev stays open by default.
//
// Uses a real login page + session cookie rather than HTTP Basic Auth.
// Basic Auth relied on the browser's native credential prompt, which is
// unreliable inside installed/standalone PWAs (particularly iOS home
// screen launches) — it would sometimes just show the bare 401 body with
// no prompt and no way to retry. A cookie set by an actual page works
// identically in a normal tab or a standalone PWA.
//
// A few routes are excluded from the gate entirely:
// - The Instagram webhook: Meta calls it server-to-server with no browser
//   session, and it already verifies requests itself (HMAC signature on
//   POST, hub.verify_token on the GET handshake) — see
//   src/app/api/instagram/webhook/route.ts.
// - /api/health: external uptime monitors and Railway's own healthcheck
//   can't log in either.
// - /login and /api/auth/login: have to be reachable *before* you're
//   authenticated, or nobody could ever log in.
// - /privacy and /terms: must be publicly readable — Meta's App Review
//   requires the Privacy Policy URL to load with no login, and future
//   subscribers need to read them before signing up.

export function proxy(request: NextRequest) {
  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword) return NextResponse.next();

  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (isValidSession(cookie)) return NextResponse.next();

  // Anything under /api/* gets a plain 401 (fetch callers handle status
  // codes, not redirects). Everything else — a full page load or a
  // Next.js client-side RSC navigation fetch, which doesn't send an
  // Accept: text/html header the way a real navigation does — redirects
  // to the login page; Next's router follows redirects on RSC fetches
  // correctly, so this covers both cases with one check.
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // NextResponse.redirect() needs an absolute URL, and — unlike the Route
  // Handlers under /api/auth/*, where request.url's origin was unreliable
  // behind Railway's edge — request.url here is correct; this is Next's
  // Proxy runtime, which does its own internal parsing of the Location
  // header on whatever a proxy function returns, and throws ("Invalid
  // URL") if it isn't a fully-qualified URL. A relative Location (the fix
  // used in the Route Handlers) crashes here instead of just being
  // resolved client-side.
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!api/instagram/webhook|api/health|api/auth/login|login|privacy|terms|_next/static|_next/image|favicon.ico).*)",
  ],
};
