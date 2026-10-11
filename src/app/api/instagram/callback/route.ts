import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { exchangeCodeForShortLivedToken, exchangeForLongLivedToken } from "@/lib/instagram/auth";
import { getProfile } from "@/lib/instagram/client";
import { redirectTo } from "@/lib/auth";
import { getCurrentUserId } from "@/lib/session";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return redirectTo("/login?next=/profile");

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

    // One Instagram account can only belong to one CMPND user - without
    // this check, connecting an account someone else already connected
    // would overwrite their stored token.
    const existingOwner = await db.account.findUnique({ where: { igUserId: profile.id } });
    if (existingOwner && existingOwner.userId !== userId) {
      params.set("error", "already_connected");
    } else {
      await db.account.upsert({
        where: { userId },
        create: {
          userId,
          igUserId: profile.id,
          username: profile.username,
          accountType: profile.accountType,
          accessToken,
          tokenExpiresAt: expiresAt,
        },
        update: {
          igUserId: profile.id,
          username: profile.username,
          accountType: profile.accountType,
          accessToken,
          tokenExpiresAt: expiresAt,
        },
      });
      params.set("connected", profile.username);
    }
  } catch (error) {
    console.error("Instagram OAuth callback failed", error);
    params.set("error", "connection_failed");
  }

  const response = redirectTo(`/profile?${params.toString()}`);
  response.cookies.delete("ig_oauth_state");
  return response;
}
