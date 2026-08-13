import { CalendarClock, Film, Image as ImageIcon, Scale, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBadge } from "@/components/icon-badge";
import { MetricLineChart } from "@/components/metric-line-chart";
import {
  getBestDayToPost,
  getContentMixComparison,
  getEngagementTrend,
  getPostingConsistency,
} from "@/lib/insights";
import { formatCompactNumber, formatPercent } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const [consistency, bestDays, trend, mix] = await Promise.all([
    getPostingConsistency(),
    getBestDayToPost(),
    getEngagementTrend(),
    getContentMixComparison(),
  ]);

  const hasAnyData = consistency.daysSinceLastPost != null;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
        <p className="text-sm text-muted-foreground">
          Deterministic growth signals derived from your history — posting cadence, timing, and
          trend, not AI narrative.
        </p>
      </div>

      {!hasAnyData ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            Sync some Reels or Posts first — these cards need real history to compute anything
            useful.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconBadge icon={CalendarClock} color="blue" size="sm" />
                Posting consistency
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-2xl font-semibold">{consistency.last7Days}</p>
                  <p className="text-xs text-muted-foreground">last 7 days</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{consistency.last30Days}</p>
                  <p className="text-xs text-muted-foreground">last 30 days</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">
                    {consistency.daysSinceLastPost ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">days since last post</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconBadge icon={TrendingUp} color="orange" size="sm" />
                Best day to post
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!bestDays ? (
                <p className="text-sm text-muted-foreground">
                  Not enough data yet — need at least 5 posted items with insights.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {bestDays.map((d, i) => (
                    <div key={d.day} className="flex items-center justify-between text-sm">
                      <span className={i === 0 ? "font-medium" : "text-muted-foreground"}>
                        {i === 0 && "🏆 "}
                        {d.day}
                      </span>
                      <span className="text-muted-foreground">
                        {formatPercent(d.avgEngagementRate)} avg · {d.count} item
                        {d.count === 1 ? "" : "s"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconBadge icon={TrendingUp} color="aqua" size="sm" />
                Engagement trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trend.length > 1 ? (
                <MetricLineChart data={trend} dataKey="engagement" label="Engagement rate" height={220} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Appears once you have a few posted items with engagement data.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconBadge icon={Scale} color="magenta" size="sm" />
                Content mix — Reels vs. Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 rounded-md border p-4">
                  <div className="flex items-center gap-2">
                    <Film className="size-4 text-muted-foreground" />
                    <span className="font-medium">Reels</span>
                    <Badge variant="outline">{mix.reels.count}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Avg reach:{" "}
                    {mix.reels.avgReach != null ? formatCompactNumber(mix.reels.avgReach) : "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Avg engagement:{" "}
                    {mix.reels.avgEngagementRate != null
                      ? formatPercent(mix.reels.avgEngagementRate)
                      : "—"}
                  </p>
                </div>
                <div className="flex flex-col gap-2 rounded-md border p-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="size-4 text-muted-foreground" />
                    <span className="font-medium">Posts</span>
                    <Badge variant="outline">{mix.posts.count}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Avg reach:{" "}
                    {mix.posts.avgReach != null ? formatCompactNumber(mix.posts.avgReach) : "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Avg engagement:{" "}
                    {mix.posts.avgEngagementRate != null
                      ? formatPercent(mix.posts.avgEngagementRate)
                      : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
