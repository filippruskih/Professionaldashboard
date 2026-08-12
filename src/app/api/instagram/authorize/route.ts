import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/lib/instagram/auth";

export async function GET() {
  const state = randomBytes(16).toString("hex");
  const response = NextResponse.redirect(getAuthorizationUrl(state));
  response.cookies.set("ig_oauth_state", state, {
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });
  return response;
}
