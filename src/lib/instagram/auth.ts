import { instagramConfig, IG_SCOPES } from "./config";

export function getAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: instagramConfig.appId,
    redirect_uri: instagramConfig.redirectUri,
    response_type: "code",
    scope: IG_SCOPES.join(","),
    state,
  });
  return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForShortLivedToken(code: string): Promise<{
  accessToken: string;
  igUserId: string;
}> {
  const body = new URLSearchParams({
    client_id: instagramConfig.appId,
    client_secret: instagramConfig.appSecret,
    grant_type: "authorization_code",
    redirect_uri: instagramConfig.redirectUri,
    code,
  });

  const res = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    throw new Error(`Failed to exchange code for token: ${res.status} ${await res.text()}`);
  }

  const json = await res.json();
  const entry = json.data?.[0] ?? json;
  return { accessToken: entry.access_token, igUserId: String(entry.user_id) };
}

export async function exchangeForLongLivedToken(shortLivedToken: string): Promise<{
  accessToken: string;
  expiresAt: Date;
}> {
  const params = new URLSearchParams({
    grant_type: "ig_exchange_token",
    client_secret: instagramConfig.appSecret,
    access_token: shortLivedToken,
  });

  const res = await fetch(`https://graph.instagram.com/access_token?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to exchange for long-lived token: ${res.status} ${await res.text()}`);
  }

  const json = await res.json();
  return {
    accessToken: json.access_token,
    expiresAt: new Date(Date.now() + json.expires_in * 1000),
  };
}

export async function refreshLongLivedToken(accessToken: string): Promise<{
  accessToken: string;
  expiresAt: Date;
}> {
  const params = new URLSearchParams({
    grant_type: "ig_refresh_token",
    access_token: accessToken,
  });

  const res = await fetch(`https://graph.instagram.com/refresh_access_token?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to refresh token: ${res.status} ${await res.text()}`);
  }

  const json = await res.json();
  return {
    accessToken: json.access_token,
    expiresAt: new Date(Date.now() + json.expires_in * 1000),
  };
}
