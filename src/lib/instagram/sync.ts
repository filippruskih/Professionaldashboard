import { db } from "@/lib/db";
import { classifyReel, classifyTopics } from "@/lib/content/classify";
import { getVideoDurationMs } from "@/lib/video/duration";
import { refreshLongLivedToken } from "./auth";
import {
  getProfile,
  getRecentMedia,
  getReelInsights,
  getPostInsights,
  getFollowsAndUnfollows,
  type InstagramMedia,
} from "./client";

const REFRESH_IF_EXPIRING_WITHIN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MEDIA_FETCH_LIMIT = 100; // combined Reels + Posts, paged in one walk

async function tryGetFollowsAndUnfollows(accessToken: string, igUserId: string) {
  try {
    const until = new Date();
    const since = new Date(until.getTime() - 24 * 60 * 60 * 1000);
    return await getFollowsAndUnfollows(accessToken, igUserId, since, until);
  } catch (error) {
    console.error("Failed to fetch follows_and_unfollows (non-fatal)", error);
    return null;
  }
}

function computeEngagementRate(totalInteractions: number | null, reach: number | null): number | null {
  if (!totalInteractions || !reach) return null;
  return totalInteractions / reach;
}

// Upsert keyed on igMediaId *and* userId: if a reel with this media id
// somehow already belongs to a different user (e.g. an Instagram account
// that was disconnected from one CMPND user and connected to another),
// the where won't match, the create collides on igMediaId's unique
// constraint, and this throws - failing closed instead of silently
// writing into someone else's rows.
async function syncReel(userId: string, accessToken: string, item: InstagramMedia) {
  const savedReel = await db.reel.upsert({
    where: { igMediaId: item.id, userId },
    create: {
      userId,
      igMediaId: item.id,
      permalink: item.permalink,
      caption: item.caption,
      postedAt: new Date(item.timestamp),
      thumbnailUrl: item.thumbnailUrl,
      mediaProductType: item.mediaProductType,
    },
    update: {
      caption: item.caption,
      thumbnailUrl: item.thumbnailUrl,
    },
  });

  if (!savedReel.format && process.env.ANTHROPIC_API_KEY) {
    try {
      const classification = await classifyReel(savedReel.caption);
      await db.reel.update({
        where: { id: savedReel.id },
        data: {
          format: classification.format,
          topicTags: JSON.stringify(classification.topics),
        },
      });
    } catch (error) {
      console.error(`Failed to classify reel ${savedReel.id}`, error);
    }
  }

  // A reel's duration never changes once posted, so only probe it once.
  if (savedReel.durationMs == null && item.mediaUrl) {
    try {
      const durationMs = await getVideoDurationMs(item.mediaUrl);
      if (durationMs != null) {
        await db.reel.update({ where: { id: savedReel.id }, data: { durationMs } });
      }
    } catch (error) {
      console.error(`Failed to probe duration for reel ${savedReel.id}`, error);
    }
  }

  const insights = await getReelInsights(accessToken, item.id);

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

async function syncPost(userId: string, accessToken: string, item: InstagramMedia) {
  const savedPost = await db.post.upsert({
    where: { igMediaId: item.id, userId },
    create: {
      userId,
      igMediaId: item.id,
      permalink: item.permalink,
      caption: item.caption,
      postedAt: new Date(item.timestamp),
      thumbnailUrl: item.thumbnailUrl,
      mediaType: item.mediaType,
    },
    update: {
      caption: item.caption,
      thumbnailUrl: item.thumbnailUrl,
    },
  });

  if (!savedPost.topicTags && process.env.ANTHROPIC_API_KEY) {
    try {
      const topics = await classifyTopics(savedPost.caption);
      await db.post.update({
        where: { id: savedPost.id },
        data: { topicTags: JSON.stringify(topics) },
      });
    } catch (error) {
      console.error(`Failed to classify post ${savedPost.id}`, error);
    }
  }

  const insights = await getPostInsights(accessToken, item.id);

  await db.postInsightSnapshot.create({
    data: {
      postId: savedPost.id,
      views: insights.views,
      likes: insights.likes,
      comments: insights.comments,
      shares: insights.shares,
      saved: insights.saved,
      reach: insights.reach,
      totalInteractions: insights.totalInteractions,
      engagementRate: computeEngagementRate(insights.totalInteractions, insights.reach),
    },
  });
}

export interface SyncResult {
  username: string;
  followerCount: number;
  reelsSynced: number;
  postsSynced: number;
}

export async function runInstagramSync(userId: string): Promise<SyncResult> {
  const account = await db.account.findUnique({ where: { userId } });
  if (!account) {
    throw new Error("No Instagram account connected. Connect one from Profile first.");
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
  const followActivity = await tryGetFollowsAndUnfollows(accessToken, profile.id);

  await db.$transaction([
    db.account.update({
      where: { id: account.id },
      data: { username: profile.username, accountType: profile.accountType },
    }),
    db.followerSnapshot.create({
      data: {
        userId,
        followerCount: profile.followersCount,
        followsCount: profile.followsCount,
        mediaCount: profile.mediaCount,
        newFollows: followActivity?.follows ?? null,
        newUnfollows: followActivity?.unfollows ?? null,
      },
    }),
  ]);

  const media = await getRecentMedia(accessToken, profile.id, MEDIA_FETCH_LIMIT);
  const reelItems = media.filter((item) => item.mediaProductType === "REELS");
  const postItems = media.filter((item) => item.mediaProductType === "FEED");

  for (const item of reelItems) {
    await syncReel(userId, accessToken, item);
  }
  for (const item of postItems) {
    await syncPost(userId, accessToken, item);
  }

  return {
    username: profile.username,
    followerCount: profile.followersCount,
    reelsSynced: reelItems.length,
    postsSynced: postItems.length,
  };
}
