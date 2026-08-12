import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricLineChart } from "@/components/metric-line-chart";
import { ReelsTable } from "@/components/reels/reels-table";
import { EmptyState } from "@/components/empty-state";
import { ListTree } from "lucide-react";
import { getSeriesDetail } from "@/lib/series";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const series = await getSeriesDetail(id);
  if (!series) notFound();

  const viewsHistory = series.reels
    .filter((r) => typeof r.latestInsight?.views === "number")
    .map((r) => ({ date: r.postedAt.toISOString(), value: r.latestInsight!.views! }));

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{series.name}</h1>
        {series.description && (
          <p className="text-sm text-muted-foreground">{series.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {series.reels.length} reel{series.reels.length === 1 ? "" : "s"} · since{" "}
          {formatDate(series.startDate)}
        </p>
      </div>

      {series.reels.length === 0 ? (
        <EmptyState
          icon={ListTree}
          title="No reels tagged yet"
          description="Assign reels to this series from each reel's detail page."
        />
      ) : (
        <>
          {viewsHistory.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Plays across the series</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricLineChart data={viewsHistory} dataKey="views" label="Plays" height={220} />
              </CardContent>
            </Card>
          )}

          <ReelsTable reels={series.reels} />
        </>
      )}
    </div>
  );
}
