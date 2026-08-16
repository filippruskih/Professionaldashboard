import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  checkPassword,
  clearAttempts,
  clientIp,
  getSessionToken,
  isLocked,
  recordFailure,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const rawNext = String(formData.get("next") ?? "/");
  const safeNext = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  const ip = clientIp(request);

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", safeNext);

  if (isLocked(ip)) {
    loginUrl.searchParams.set("error", "locked");
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  if (!checkPassword(password)) {
    recordFailure(ip);
    loginUrl.searchParams.set("error", "1");
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  clearAttempts(ip);

  const token = getSessionToken();
  const response = NextResponse.redirect(new URL(safeNext, request.url), { status: 303 });
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
