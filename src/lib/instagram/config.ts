function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Set it in .env.local (see .env.local.example).`
    );
  }
  return value;
}

export const instagramConfig = {
  get appId() {
    return requireEnv("IG_APP_ID");
  },
  get appSecret() {
    return requireEnv("IG_APP_SECRET");
  },
  get redirectUri() {
    return requireEnv("IG_REDIRECT_URI");
  },
  isConfigured() {
    return Boolean(
      process.env.IG_APP_ID && process.env.IG_APP_SECRET && process.env.IG_REDIRECT_URI
    );
  },
};

export const IG_SCOPES = [
  "instagram_business_basic",
  "instagram_business_manage_insights",
  "instagram_business_manage_messages",
] as const;

export const IG_API_VERSION = "v25.0";
export const IG_GRAPH_BASE = `https://graph.instagram.com/${IG_API_VERSION}`;
