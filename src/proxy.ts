import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionCookie } from "@/lib/auth";

// Gates the dashboard behind real per-user accounts (email + password,
// see /signup and /login). Session is a signed, stateless cookie (see
// lib/auth.ts createSessionCookieValue) - verified here with pure crypto,
// no DB round trip, since the Proxy runtime shouldn't depend on Postgres
// being reachable just to decide whether to redirect to /login.
//
// A few routes are excluded from the gate entirely:
// - "/": the public marketing/landing page (src/app/page.tsx) — has to be
//   readable by anyone with the URL, logged in or not. The actual
//   dashboard lives at /home, behind the gate as normal.
// - "/login" and "/signup" (and their API routes): have to be reachable
//   *before* you're authenticated, or nobody could ever log in.
// - The Instagram webhook: Meta calls it server-to-server with no browser
//   session, and it already verifies requests itself (HMAC signature on
//   POST, hub.verify_token on the GET handshake) — see
//   src/app/api/instagram/webhook/route.ts.
// - /api/health: external uptime monitors and Railway's own healthcheck
//   can't log in either.
// - /privacy and /terms: must be publicly readable — Meta's App Review
//   requires the Privacy Policy URL to load with no login, and anyone
//   signing up needs to read them first.
// - manifest.webmanifest, the icons, apple-touch-icon.png, and sw.js: the
//   browser/OS fetches these unauthenticated as part of installing the PWA
//   (checking installability, downloading the home-screen icon, checking
//   for a new service worker) — gating them meant those requests were
//   silently redirected to /login instead of returning the actual asset,
//   which can break "Add to Home Screen" and stale-icon-cache issues.

const PUBLIC_PATHS = new Set(["/", "/login", "/signup"]);

export function proxy(request: NextRequest) {
  if (PUBLIC_PATHS.has(request.nextUrl.pathname)) return NextResponse.next();

  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (verifySessionCookie(cookie)) return NextResponse.next();

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
    "/((?!api/instagram/webhook|api/health|api/auth/login|api/auth/signup|login|signup|privacy|terms|manifest\\.webmanifest|icons/|apple-touch-icon\\.png|sw\\.js|_next/static|_next/image|favicon.ico).*)",
  ],
};
