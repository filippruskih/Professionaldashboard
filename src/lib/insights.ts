import { getReelsWithLatestInsights } from "@/lib/stats";
import { getPostsWithLatestInsights } from "@/lib/posts";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MIN_ITEMS_FOR_BEST_DAY = 5;

interface CombinedItem {
  postedAt: Date;
  views: number | null;
  reach: number | null;
  engagementRate: number | null;
}

async function getCombinedItems(): Promise<CombinedItem[]> {
  const [reels, posts] = await Promise.all([
    getReelsWithLatestInsights(),
    getPostsWithLatestInsights(),
  ]);

  const fromReels: CombinedItem[] = reels.map((r) => ({
    postedAt: r.postedAt,
    views: r.latestInsight?.views ?? null,
    reach: r.latestInsight?.reach ?? null,
    engagementRate: r.latestInsight?.engagementRate ?? null,
  }));
  const fromPosts: CombinedItem[] = posts.map((p) => ({
    postedAt: p.postedAt,
    views: p.latestInsight?.views ?? null,
    reach: p.latestInsight?.reach ?? null,
    engagementRate: p.latestInsight?.engagementRate ?? null,
  }));

  return [...fromReels, ...fromPosts].sort((a, b) => a.postedAt.getTime() - b.postedAt.getTime());
}

export interface PostingConsistency {
  last7Days: number;
  last30Days: number;
  daysSinceLastPost: number | null;
}

export async function getPostingConsistency(): Promise<PostingConsistency> {
  const items = await getCombinedItems();
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  const last7Days = items.filter((i) => i.postedAt.getTime() >= sevenDaysAgo).length;
  const last30Days = items.filter((i) => i.postedAt.getTime() >= thirtyDaysAgo).length;

  const mostRecent = items.at(-1);
  const daysSinceLastPost = mostRecent
    ? Math.floor((now - mostRecent.postedAt.getTime()) / (24 * 60 * 60 * 1000))
    : null;

  return { last7Days, last30Days, daysSinceLastPost };
}

export interface BestDayToPost {
  day: string;
  avgEngagementRate: number;
  count: number;
}

export async function getBestDayToPost(): Promise<BestDayToPost[] | null> {
  const items = (await getCombinedItems()).filter((i) => i.engagementRate != null);
  if (items.length < MIN_ITEMS_FOR_BEST_DAY) return null;

  const buckets = new Map<number, number[]>();
  for (const item of items) {
    const day = item.postedAt.getDay();
    if (!buckets.has(day)) buckets.set(day, []);
    buckets.get(day)!.push(item.engagementRate!);
  }

  return Array.from(buckets.entries())
    .map(([day, rates]) => ({
      day: DAY_NAMES[day],
      avgEngagementRate: rates.reduce((sum, r) => sum + r, 0) / rates.length,
      count: rates.length,
    }))
    .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate);
}

export interface EngagementTrendPoint {
  date: string;
  value: number;
}

export async function getEngagementTrend(): Promise<EngagementTrendPoint[]> {
  const items = (await getCombinedItems()).filter((i) => i.engagementRate != null);
  return items.map((i) => ({ date: i.postedAt.toISOString(), value: i.engagementRate! }));
}

export interface ContentMixStats {
  count: number;
  avgReach: number | null;
  avgEngagementRate: number | null;
}

export interface ContentMixComparison {
  reels: ContentMixStats;
  posts: ContentMixStats;
}

function summarize(items: CombinedItem[]): ContentMixStats {
  const withReach = items.filter((i) => i.reach != null);
  const withEngagement = items.filter((i) => i.engagementRate != null);
  return {
    count: items.length,
    avgReach:
      withReach.length > 0
        ? withReach.reduce((sum, i) => sum + i.reach!, 0) / withReach.length
        : null,
    avgEngagementRate:
      withEngagement.length > 0
        ? withEngagement.reduce((sum, i) => sum + i.engagementRate!, 0) / withEngagement.length
        : null,
  };
}

export async function getContentMixComparison(): Promise<ContentMixComparison> {
  const [reels, posts] = await Promise.all([
    getReelsWithLatestInsights(),
    getPostsWithLatestInsights(),
  ]);

  const reelItems: CombinedItem[] = reels.map((r) => ({
    postedAt: r.postedAt,
    views: r.latestInsight?.views ?? null,
    reach: r.latestInsight?.reach ?? null,
    engagementRate: r.latestInsight?.engagementRate ?? null,
  }));
  const postItems: CombinedItem[] = posts.map((p) => ({
    postedAt: p.postedAt,
    views: p.latestInsight?.views ?? null,
    reach: p.latestInsight?.reach ?? null,
    engagementRate: p.latestInsight?.engagementRate ?? null,
  }));

  return { reels: summarize(reelItems), posts: summarize(postItems) };
}
