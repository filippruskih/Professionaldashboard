import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE = "dashboard_session";

export function isAuthEnabled(): boolean {
  return Boolean(process.env.SITE_PASSWORD);
}

// Deterministic token derived from SITE_PASSWORD rather than a random
// server-side session id — needs no session store, and changing the
// password automatically invalidates every existing cookie.
export function getSessionToken(): string | null {
  const password = process.env.SITE_PASSWORD;
  if (!password) return null;
  return createHmac("sha256", password).update("creator-dashboard-session").digest("hex");
}

export function isValidSession(cookieValue: string | undefined): boolean {
  const expected = getSessionToken();
  if (!expected || !cookieValue) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(cookieValue));
  } catch {
    return false; // length mismatch etc.
  }
}

export function checkPassword(password: string): boolean {
  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword) return false;
  try {
    return timingSafeEqual(Buffer.from(password), Buffer.from(sitePassword));
  } catch {
    return false; // length mismatch etc.
  }
}

// Brute-force lockout on login attempts. In-memory is fine here (not a
// distributed rate limiter) because Railway runs this as one long-lived
// Node process, not serverless functions that reset state between
// requests — it just resets on redeploy, an acceptable tradeoff for a
// personal single-user app rather than pulling in Redis for this.
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
