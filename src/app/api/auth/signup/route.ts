import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  SESSION_COOKIE,
  clearAttempts,
  clientIp,
  createSessionCookieValue,
  hashPassword,
  isLocked,
  recordFailure,
  redirectTo,
} from "@/lib/auth";

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const ip = clientIp(request);
  const fail = (error: string) => redirectTo(`/signup?error=${error}&email=${encodeURIComponent(email)}`);

  if (isLocked(ip)) return fail("locked");
  if (!EMAIL_PATTERN.test(email)) return fail("email");
  if (password.length < MIN_PASSWORD_LENGTH) return fail("short");
  if (password !== confirm) return fail("mismatch");

  const existing = await db.user.findUnique({ where: { email } });

  // An existing row with no password is an unclaimed account created by
  // the multi-user migration for data that predates accounts (see that
  // migration's SQL) - signing up with its email claims it, rather than
  // being rejected as a duplicate.
  if (existing?.passwordHash) {
    recordFailure(ip);
    return fail("taken");
  }

  const passwordHash = await hashPassword(password);
  const user = existing
    ? await db.user.update({ where: { id: existing.id }, data: { passwordHash } })
    : await db.user.create({ data: { email, passwordHash } });

  clearAttempts(ip);

  // Straight to Profile to connect Instagram - nothing else in the app has
  // data to show until that's done.
  const response = redirectTo(existing ? "/home" : "/profile?welcome=1");
  response.cookies.set(SESSION_COOKIE, createSessionCookieValue(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return response;
}
