import { db } from "@/lib/db";
import { getOverviewStats, getReelsWithLatestInsights } from "@/lib/stats";
import { getPostsWithLatestInsights } from "@/lib/posts";
import {
  getPostingConsistency,
  getBestDayToPost,
  getContentMixComparison,
} from "@/lib/insights";
import { getLatestContentDna } from "@/lib/content-dna";
import { formatLabel } from "@/lib/content/classify";
import { formatCompactNumber, formatDate, formatPercent, formatSignedCompactNumber } from "@/lib/format";

const TOP_ITEMS_COUNT = 8;

// Assembles everything the dashboard knows into one clean Markdown blob -
// meant to be copy-pasted into a separate chat (e.g. Claude.ai) for
// analytics review, since that chat has no way to log into the
// password-gated dashboard itself.
export async function generateAnalyticsExport(): Promise<string> {
  const [account, overview, consistency, bestDays, mix, dna, reels, posts] = await Promise.all([
    db.account.findFirst(),
    getOverviewStats(),
    getPostingConsistency(),
    getBestDayToPost(),
    getContentMixComparison(),
    getLatestContentDna(),
    getReelsWithLatestInsights(),
    getPostsWithLatestInsights(),
  ]);

  const lines: string[] = [];
  const push = (line = "") => lines.push(line);

  push(`# Instagram analytics export${account ? ` - @${account.username}` : ""}`);
  push(`Generated ${formatDate(new Date())}`);
  push();

  push("## Overview");
  push(`- Followers: ${overview.followerCount != null ? formatCompactNumber(overview.followerCount) : "unknown"}${
    overview.followerDelta != null ? ` (${formatSignedCompactNumber(overview.followerDelta)} since last sync)` : ""
  }`);
  push(`- Reels synced: ${overview.reelCount}`);
  push(`- Avg plays per reel: ${overview.avgPlays != null ? formatCompactNumber(overview.avgPlays) : "n/a"}`);
  push(`- Avg engagement rate: ${overview.avgEngagementRate != null ? formatPercent(overview.avgEngagementRate) : "n/a"}`);
  push();

  push("## Posting consistency");
  push(`- Last 7 days: ${consistency.last7Days} items posted`);
  push(`- Last 30 days: ${consistency.last30Days} items posted`);
  push(`- Days since last post: ${consistency.daysSinceLastPost ?? "n/a"}`);
  push();

  push("## Best day to post");
  if (bestDays) {
    for (const d of bestDays) {
      push(`- ${d.day}: ${formatPercent(d.avgEngagementRate)} avg engagement (${d.count} items)`);
    }
  } else {
    push("- Not enough data yet (need at least 5 posted items with engagement data).");
  }
  push();

  push("## Content mix - Reels vs. Posts");
  push(
    `- Reels: ${mix.reels.count} items, avg reach ${
      mix.reels.avgReach != null ? formatCompactNumber(mix.reels.avgReach) : "n/a"
    }, avg engagement ${mix.reels.avgEngagementRate != null ? formatPercent(mix.reels.avgEngagementRate) : "n/a"}`
  );
  push(
    `- Posts: ${mix.posts.count} items, avg reach ${
      mix.posts.avgReach != null ? formatCompactNumber(mix.posts.avgReach) : "n/a"
    }, avg engagement ${mix.posts.avgEngagementRate != null ? formatPercent(mix.posts.avgEngagementRate) : "n/a"}`
  );
  push();

  push("## Content DNA");
  if (dna) {
    push(`Generated ${formatDate(dna.generatedAt)}`);
    push(dna.narrative);
    if (dna.topFormats.length > 0) {
      push(`Formats that outperform: ${dna.topFormats.map((f) => `${formatLabel(f.key)} (${formatCompactNumber(f.avgViews)} avg plays)`).join(", ")}`);
    }
    if (dna.topTopics.length > 0) {
      push(`Topics that outperform: ${dna.topTopics.map((t) => `${t.key} (${formatCompactNumber(t.avgViews)} avg plays)`).join(", ")}`);
    }
  } else {
    push("Not generated yet (needs at least 5 reels synced and an Analytics agent run).");
  }
  push();

  push(`## Top ${TOP_ITEMS_COUNT} reels by plays`);
  const topReels = [...reels]
    .filter((r) => r.latestInsight?.views != null)
    .sort((a, b) => (b.latestInsight!.views ?? 0) - (a.latestInsight!.views ?? 0))
    .slice(0, TOP_ITEMS_COUNT);
  if (topReels.length === 0) {
    push("- No reel insight data yet.");
  } else {
    for (const r of topReels) {
      push(
        `- "${r.caption ?? "(no caption)"}" - ${formatCompactNumber(r.latestInsight!.views!)} plays, ${
          r.latestInsight?.engagementRate != null ? formatPercent(r.latestInsight.engagementRate) : "n/a"
        } engagement${r.format ? `, ${formatLabel(r.format)}` : ""} (${formatDate(r.postedAt)})`
      );
    }
  }
  push();

  push(`## Top ${TOP_ITEMS_COUNT} posts by reach`);
  const topPosts = [...posts]
    .filter((p) => p.latestInsight?.reach != null)
    .sort((a, b) => (b.latestInsight!.reach ?? 0) - (a.latestInsight!.reach ?? 0))
    .slice(0, TOP_ITEMS_COUNT);
  if (topPosts.length === 0) {
    push("- No post insight data yet.");
  } else {
    for (const p of topPosts) {
      push(
        `- "${p.caption ?? "(no caption)"}" - ${formatCompactNumber(p.latestInsight!.reach!)} reach, ${
          p.latestInsight?.engagementRate != null ? formatPercent(p.latestInsight.engagementRate) : "n/a"
        } engagement (${formatDate(p.postedAt)})`
      );
    }
  }

  return lines.join("\n");
}
