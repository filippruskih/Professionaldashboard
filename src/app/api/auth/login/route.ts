import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  SESSION_COOKIE,
  clearAttempts,
  clientIp,
  createSessionCookieValue,
  isLocked,
  recordFailure,
  redirectTo,
  verifyPassword,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const rawNext = String(formData.get("next") ?? "/home");
  const safeNext = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/home";

  const ip = clientIp(request);
  const loginPath = `/login?next=${encodeURIComponent(safeNext)}&email=${encodeURIComponent(email)}`;

  if (isLocked(ip)) {
    return redirectTo(`${loginPath}&error=locked`);
  }

  const user = await db.user.findUnique({ where: { email } });
  // verifyPassword is called even when the user doesn't exist (against a
  // null hash, which always fails) so a missing account and a wrong
  // password take the same code path and the same error message.
  const valid = await verifyPassword(password, user?.passwordHash ?? null);

  if (!user || !valid) {
    recordFailure(ip);
    return redirectTo(`${loginPath}&error=1`);
  }

  clearAttempts(ip);

  const response = redirectTo(safeNext);
  response.cookies.set(SESSION_COOKIE, createSessionCookieValue(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return response;
}
