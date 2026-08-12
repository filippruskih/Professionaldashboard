import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exchangeCodeForShortLivedToken, exchangeForLongLivedToken } from "@/lib/instagram/auth";
import { getProfile } from "@/lib/instagram/client";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = request.cookies.get("ig_oauth_state")?.value;

  const settingsUrl = new URL("/settings", url.origin);

  if (!code || !state || !storedState || state !== storedState) {
    settingsUrl.searchParams.set("error", "invalid_oauth_state");
    return NextResponse.redirect(settingsUrl);
  }

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

    settingsUrl.searchParams.set("connected", profile.username);
  } catch (error) {
    console.error("Instagram OAuth callback failed", error);
    settingsUrl.searchParams.set("error", "connection_failed");
  }

  const response = NextResponse.redirect(settingsUrl);
  response.cookies.delete("ig_oauth_state");
  return response;
}
