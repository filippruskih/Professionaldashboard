import { NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  checkPassword,
  clearAttempts,
  clientIp,
  getSessionToken,
  isLocked,
  recordFailure,
  redirectTo,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const rawNext = String(formData.get("next") ?? "/");
  const safeNext = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  const ip = clientIp(request);
  const loginPath = `/login?next=${encodeURIComponent(safeNext)}`;

  if (isLocked(ip)) {
    return redirectTo(`${loginPath}&error=locked`);
  }

  if (!checkPassword(password)) {
    recordFailure(ip);
    return redirectTo(`${loginPath}&error=1`);
  }

  clearAttempts(ip);

  const token = getSessionToken();
  const response = redirectTo(safeNext);
  if (token) {
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }
  return response;
}
