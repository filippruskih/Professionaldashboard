import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { exchangeCodeForShortLivedToken, exchangeForLongLivedToken } from "@/lib/instagram/auth";
import { getProfile } from "@/lib/instagram/client";
import { redirectTo } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = request.cookies.get("ig_oauth_state")?.value;

  if (!code || !state || !storedState || state !== storedState) {
    const response = redirectTo("/profile?error=invalid_oauth_state");
    response.cookies.delete("ig_oauth_state");
    return response;
  }

  const params = new URLSearchParams();
  try {
    const { accessToken: shortLivedToken } = await exchangeCodeForShortLivedToken(code);
    const { accessToken, expiresAt } = await exchangeForLongLivedToken(shortLivedToken);
    const profile = await getProfile(accessToken);

    await db.account.upsert({
      where: { igUserId: profile.id },
      create: {
        igUserId: profile.id,
        username: profile.username,
        accountType: profile.accountType,
        accessToken,
        tokenExpiresAt: expiresAt,
      },
      update: {
        username: profile.username,
        accountType: profile.accountType,
        accessToken,
        tokenExpiresAt: expiresAt,
      },
    });

    params.set("connected", profile.username);
  } catch (error) {
    console.error("Instagram OAuth callback failed", error);
    params.set("error", "connection_failed");
  }

  const response = redirectTo(`/profile?${params.toString()}`);
  response.cookies.delete("ig_oauth_state");
  return response;
}
