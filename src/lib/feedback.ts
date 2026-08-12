import { formatLabel } from "@/lib/content/classify";
import { getReelsWithLatestInsights, type ReelWithLatestInsight } from "@/lib/stats";

export interface BaselineComparison {
  key: string;
  label: string;
  sampleSize: number;
  avgViews: number | null;
  avgEngagementRate: number | null;
  avgWatchTimeMs: number | null;
}

export interface FeedbackLoopResult {
  reel: ReelWithLatestInsight;
  baselines: BaselineComparison[];
}

function average(values: (number | null | undefined)[]): number | null {
  const nums = values.filter((v): v is number => typeof v === "number");
  if (nums.length === 0) return null;
  return nums.reduce((sum, v) => sum + v, 0) / nums.length;
}

function summarizeGroup(
  key: string,
  label: string,
  group: ReelWithLatestInsight[]
): BaselineComparison {
  return {
    key,
    label,
    sampleSize: group.length,
    avgViews: average(group.map((r) => r.latestInsight?.views)),
    avgEngagementRate: average(group.map((r) => r.latestInsight?.engagementRate)),
    avgWatchTimeMs: average(group.map((r) => r.latestInsight?.avgWatchTimeMs)),
  };
}

function parseTopics(topicTags: string | null): string[] {
  if (!topicTags) return [];
  try {
    return JSON.parse(topicTags) as string[];
  } catch {
    return [];
  }
}

// Every reel is scored against five baselines: your all-time average, your
// top 10%, your previous 10 reels, reels sharing a topic tag, and reels
// sharing a format. "Same length" and "competitor content" baselines are
// intentionally not included — see the reel detail page for why.
export async function getFeedbackLoop(reelId: string): Promise<FeedbackLoopResult | null> {
  const allReels = await getReelsWithLatestInsights(); // sorted postedAt desc
  const index = allReels.findIndex((r) => r.id === reelId);
  if (index === -1) return null;

  const reel = allReels[index];
  const others = allReels.filter((r) => r.id !== reelId);

  const rankedByViews = others
    .filter((r) => typeof r.latestInsight?.views === "number")
    .sort((a, b) => (b.latestInsight!.views ?? 0) - (a.latestInsight!.views ?? 0));
  const topCount = Math.max(1, Math.ceil(rankedByViews.length * 0.1));
  const topGroup = rankedByViews.slice(0, topCount);

  // allReels is sorted newest-first, so reels after this one's index are older.
  const previous10 = allReels.slice(index + 1, index + 11);

  const sameFormat = reel.format ? others.filter((r) => r.format === reel.format) : [];

  const reelTopics = parseTopics(reel.topicTags);
  const sameTopic =
    reelTopics.length > 0
      ? others.filter((r) => parseTopics(r.topicTags).some((t) => reelTopics.includes(t)))
      : [];

  const baselines: BaselineComparison[] = [
    summarizeGroup("average", "Your average", others),
    summarizeGroup("top10", "Your top 10%", topGroup),
    summarizeGroup("previous10", "Previous 10 reels", previous10),
    summarizeGroup(
      "sameFormat",
      reel.format ? `Same format (${formatLabel(reel.format)})` : "Same format",
      sameFormat
    ),
    summarizeGroup("sameTopic", "Same topic", sameTopic),
  ];

  return { reel, baselines };
}
