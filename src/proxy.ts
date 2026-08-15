import { NextResponse, type NextRequest } from "next/server";

// Gates the whole app behind a single shared password once hosted publicly.
// Only active when SITE_PASSWORD is set — local dev stays open by default.
// Two routes are excluded:
// - The Instagram webhook: Meta calls it server-to-server with no browser
//   session, and it already verifies requests itself (HMAC signature on
//   POST, hub.verify_token on the GET handshake) — see
//   src/app/api/instagram/webhook/route.ts.
// - /api/health: external uptime monitors and Railway's own healthcheck
//   can't present credentials either.

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Creator Dashboard"' },
  });
}

export function proxy(request: NextRequest) {
  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword) return NextResponse.next();

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return unauthorized();

  const decoded = atob(header.slice("Basic ".length));
  const password = decoded.slice(decoded.indexOf(":") + 1);
  if (password !== sitePassword) return unauthorized();

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/instagram/webhook|api/health|_next/static|_next/image|favicon.ico).*)"],
};
