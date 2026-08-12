import { db } from "@/lib/db";
import { anthropic, requireAnthropicKey, AGENT_MODEL } from "@/lib/anthropic";
import { getReelsWithLatestInsights } from "@/lib/stats";
import { formatLabel } from "@/lib/content/classify";
import type { AgentContext } from "@/lib/agents/registry";

const MIN_REELS_FOR_DNA = 5;

interface GroupStat {
  key: string;
  avgViews: number;
  count: number;
}

function groupByViews<T>(
  items: T[],
  keyOf: (item: T) => string[],
  viewsOf: (item: T) => number | null
): GroupStat[] {
  const buckets = new Map<string, number[]>();
  for (const item of items) {
    const views = viewsOf(item);
    if (views == null) continue;
    for (const key of keyOf(item)) {
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(views);
    }
  }

  return Array.from(buckets.entries())
    .filter(([, views]) => views.length >= 2)
    .map(([key, views]) => ({
      key,
      avgViews: views.reduce((sum, v) => sum + v, 0) / views.length,
      count: views.length,
    }))
    .sort((a, b) => b.avgViews - a.avgViews)
    .slice(0, 5);
}

// Runs as the final step of the Analytics agent, not a standalone agent —
// updates the Content DNA profile from historical top performers. Silently
// no-ops (just a log line) below the reel-count threshold rather than
// throwing, since this is a sub-step, not the whole run.
export async function updateContentDna(ctx: AgentContext, sourceAgentRunId: string) {
  const reels = await getReelsWithLatestInsights();

  if (reels.length < MIN_REELS_FOR_DNA) {
    await ctx.log(
      `Skipping Content DNA update — need at least ${MIN_REELS_FOR_DNA} reels, have ${reels.length}.`
    );
    return;
  }

  const topFormats = groupByViews(
    reels,
    (r) => (r.format ? [r.format] : []),
    (r) => r.latestInsight?.views ?? null
  );
  const topTopics = groupByViews(
    reels,
    (r) => (r.topicTags ? (JSON.parse(r.topicTags) as string[]) : []),
    (r) => r.latestInsight?.views ?? null
  );

  const withViews = reels.filter((r) => typeof r.latestInsight?.views === "number");
  const topReels = [...withViews]
    .sort((a, b) => (b.latestInsight!.views ?? 0) - (a.latestInsight!.views ?? 0))
    .slice(0, Math.max(3, Math.ceil(withViews.length * 0.1)));

  requireAnthropicKey();
  await ctx.log("Synthesizing your Content DNA from top performers…");

  const response = await anthropic.messages.create({
    model: AGENT_MODEL,
    max_tokens: 600,
    thinking: { type: "disabled" },
    messages: [
      {
        role: "user",
        content: `Here are this creator's top-performing Instagram Reels (captions, by plays):\n\n${topReels
          .map(
            (r) =>
              `- "${r.caption ?? "(no caption)"}" — ${r.latestInsight?.views ?? "?"} plays (${
                r.format ? formatLabel(r.format) : "unclassified"
              })`
          )
          .join("\n")}\n\nFormats that outperform (avg plays): ${topFormats
          .map((f) => `${formatLabel(f.key)} (${Math.round(f.avgViews)})`)
          .join(", ") || "not enough data"}\nTopics that outperform (avg plays): ${topTopics
          .map((t) => `${t.key} (${Math.round(t.avgViews)})`)
          .join(", ") || "not enough data"}\n\nWrite this creator's "Content DNA" — 2-3 short paragraphs identifying recurring hooks, tone, and patterns across their top reels, and what topics/formats to lean into. Be specific and reference the actual captions/data given, not generic advice.`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const narrative = textBlock && textBlock.type === "text" ? textBlock.text.trim() : "";

  await db.contentDnaProfile.create({
    data: {
      narrative: narrative || "No narrative generated.",
      topFormatsJson: JSON.stringify(topFormats),
      topTopicsJson: JSON.stringify(topTopics),
      sourceAgentRunId,
    },
  });

  await ctx.log("Content DNA profile updated.");
}
