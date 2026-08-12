import { db } from "@/lib/db";
import { refreshLongLivedToken } from "./auth";
import { getProfile, getRecentReels, getReelInsights } from "./client";

const REFRESH_IF_EXPIRING_WITHIN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function computeEngagementRate(totalInteractions: number | null, reach: number | null): number | null {
  if (!totalInteractions || !reach) return null;
  return totalInteractions / reach;
}

export interface SyncResult {
  username: string;
  followerCount: number;
  reelsSynced: number;
}

export async function runInstagramSync(): Promise<SyncResult> {
  const account = await db.account.findFirst();
  if (!account) {
    throw new Error("No Instagram account connected. Connect one from Settings first.");
  }

  let accessToken = account.accessToken;

  if (account.tokenExpiresAt.getTime() - Date.now() < REFRESH_IF_EXPIRING_WITHIN_MS) {
    const refreshed = await refreshLongLivedToken(accessToken);
    accessToken = refreshed.accessToken;
    await db.account.update({
      where: { id: account.id },
      data: { accessToken: refreshed.accessToken, tokenExpiresAt: refreshed.expiresAt },
    });
  }

  const profile = await getProfile(accessToken);

  await db.$transaction([
    db.account.update({
      where: { id: account.id },
      data: { username: profile.username, accountType: profile.accountType },
    }),
    db.followerSnapshot.create({
      data: {
        followerCount: profile.followersCount,
        followsCount: profile.followsCount,
        mediaCount: profile.mediaCount,
      },
    }),
  ]);

  const reels = await getRecentReels(accessToken, profile.id, 50);

  for (const reel of reels) {
    const savedReel = await db.reel.upsert({
      where: { igMediaId: reel.id },
      create: {
        igMediaId: reel.id,
        permalink: reel.permalink,
        caption: reel.caption,
        postedAt: new Date(reel.timestamp),
        thumbnailUrl: reel.thumbnailUrl,
        mediaProductType: reel.mediaProductType,
      },
      update: {
        caption: reel.caption,
        thumbnailUrl: reel.thumbnailUrl,
      },
    });

    const insights = await getReelInsights(accessToken, reel.id);

    await db.reelInsightSnapshot.create({
      data: {
        reelId: savedReel.id,
        views: insights.views,
        likes: insights.likes,
        comments: insights.comments,
        shares: insights.shares,
        saved: insights.saved,
        reach: insights.reach,
        totalInteractions: insights.totalInteractions,
        avgWatchTimeMs: insights.avgWatchTimeMs,
        engagementRate: computeEngagementRate(insights.totalInteractions, insights.reach),
      },
    });
  }

  return {
    username: profile.username,
    followerCount: profile.followersCount,
    reelsSynced: reels.length,
  };
}
