// One-off admin utility for linking an Instagram access token obtained
// outside the app's own OAuth flow (e.g. via the Meta App Dashboard's
// "Generate token" button on the Instagram API setup page) into a
// specific database's Account table. The normal /api/instagram/callback
// route does this automatically for tokens obtained through the app's own
// "Connect Instagram" button — this script exists for the case where a
// tester's token was generated directly through Meta's own tooling
// instead, so it never passed through that route.
//
// Usage (run from the repo root):
//   DATABASE_URL="<target database's connection string>" npx tsx scripts/link-account.ts "<access-token>"
//
// DATABASE_URL should point at whichever database this token's account
// belongs in (e.g. the isolated test instance's database) — NOT
// necessarily the one in .env.local. IG_APP_SECRET is read from
// .env.local as usual (same Meta app is reused across instances, so this
// doesn't need to change).
import { db } from "../src/lib/db";
import { exchangeForLongLivedToken } from "../src/lib/instagram/auth";
import { getProfile } from "../src/lib/instagram/client";

async function main() {
  const token = process.argv[2];
  if (!token) {
    console.error('Usage: DATABASE_URL="..." npx tsx scripts/link-account.ts "<access-token>"');
    process.exit(1);
  }

  let accessToken = token;
  let tokenExpiresAt: Date;
  try {
    const exchanged = await exchangeForLongLivedToken(token);
    accessToken = exchanged.accessToken;
    tokenExpiresAt = exchanged.expiresAt;
    console.log(`Exchanged for a long-lived token, expires ${tokenExpiresAt.toISOString()}`);
  } catch (error) {
    // Meta's dashboard "Generate token" button sometimes already hands out
    // a long-lived token, which this exchange call rejects — fall back to
    // using it as-is with a conservative 24h assumed expiry rather than
    // failing outright.
    console.warn(
      "Could not exchange for a long-lived token (it may already be one) — using it as-is:",
      error instanceof Error ? error.message : error
    );
    tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  const profile = await getProfile(accessToken);
  console.log(`Fetched profile: @${profile.username} (${profile.id})`);

  await db.account.upsert({
    where: { igUserId: profile.id },
    create: {
      igUserId: profile.id,
      username: profile.username,
      accountType: profile.accountType,
      accessToken,
      tokenExpiresAt,
    },
    update: {
      username: profile.username,
      accountType: profile.accountType,
      accessToken,
      tokenExpiresAt,
    },
  });

  console.log(`Linked @${profile.username} into this database's Account table.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
