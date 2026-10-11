import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { NextResponse, type NextRequest } from "next/server";

const scryptAsync = promisify(scrypt);

export const SESSION_COOKIE = "session";
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Signing key for session cookies - distinct from any per-user password.
// Local dev falls back to a fixed value so `npm run dev` works without
// extra setup. Production must never do that: the fallback is visible in
// this source file, so signing real sessions with it would let anyone
// forge a cookie for any user id - throwing (every auth check fails,
// nobody gets in) is the only safe failure mode.
function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set in production - refusing to sign or verify sessions without it.");
  }
  return "dev-only-insecure-secret-do-not-use-in-production";
}

// scrypt with a random salt per password, stored together as
// "salt:hash" (both hex) - no extra columns needed, and a changed salt
// invalidates nothing else since each hash is self-contained.
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  if (!stored) return false;
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const derived = (await scryptAsync(password, salt, expected.length)) as Buffer;
  try {
    return timingSafeEqual(derived, expected);
  } catch {
    return false; // length mismatch etc.
  }
}

interface SessionPayload {
  uid: string;
  exp: number;
}

function signPayload(payloadB64: string): string {
  return createHmac("sha256", authSecret()).update(payloadB64).digest("hex");
}

// A signed, stateless session cookie (no server-side session store) -
// verifiable with pure crypto, no DB round trip, so proxy.ts can check it
// on every request without needing Postgres access from the Proxy
// runtime. The tradeoff (same one the old shared-password cookie made) is
// no early revocation: logging out just deletes the cookie client-side,
// and a stolen cookie stays valid until it expires on its own.
export function createSessionCookieValue(userId: string): string {
  const payload: SessionPayload = { uid: userId, exp: Date.now() + SESSION_MAX_AGE_MS };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${payloadB64}.${signPayload(payloadB64)}`;
}

export function verifySessionCookie(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null;
  const [payloadB64, signature] = cookieValue.split(".");
  if (!payloadB64 || !signature) return null;

  const expectedSignature = signPayload(payloadB64);
  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return null;
  } catch {
    return null; // length mismatch etc.
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as SessionPayload;
    if (typeof payload.uid !== "string" || typeof payload.exp !== "number") return null;
    if (Date.now() > payload.exp) return null;
    return payload.uid;
  } catch {
    return null;
  }
}

// Brute-force lockout on login/signup attempts, keyed by IP. In-memory is
// fine here (not a distributed rate limiter) because Railway runs this as
// one long-lived Node process, not serverless functions that reset state
// between requests — it just resets on redeploy, an acceptable tradeoff
// for this app's scale rather than pulling in Redis for this.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;

interface AttemptRecord {
  count: number;
  windowStart: number;
  lockedUntil: number | null;
}

const attempts = new Map<string, AttemptRecord>();

export function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export function isLocked(ip: string): boolean {
  const record = attempts.get(ip);
  if (!record?.lockedUntil) return false;
  if (Date.now() > record.lockedUntil) {
    attempts.delete(ip);
    return false;
  }
  return true;
}

export function recordFailure(ip: string) {
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

export function clearAttempts(ip: string) {
  attempts.delete(ip);
}

// Redirects with a *relative* Location header instead of
// NextResponse.redirect(new URL(path, request.url)). Behind Railway's edge,
// request.url's origin doesn't reliably reflect the public domain (it was
// coming back as an internal/localhost-ish address), sending browsers to a
// host that doesn't exist for them. A relative Location header sidesteps
// that entirely — browsers always resolve it against whatever origin
// they're actually on, so it's correct regardless of how the origin behind
// the proxy gets reported.
export function redirectTo(path: string, status: 303 | 307 = 303): NextResponse {
  return new NextResponse(null, { status, headers: { Location: path } });
}
