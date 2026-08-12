import Link from "next/link";
import { ListTree } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewSeriesDialog } from "@/components/series/new-series-dialog";
import { getAllSeries } from "@/lib/series";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SeriesPage() {
  const series = await getAllSeries();

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Series</h1>
          <p className="text-sm text-muted-foreground">
            Group reels into a series, like &quot;Account Growth Journey&quot;, and track its
            stats from the start.
          </p>
        </div>
        <NewSeriesDialog />
      </div>

      {series.length === 0 ? (
        <EmptyState
          icon={ListTree}
          title="No series yet"
          description="Create a series and tag reels into it from each reel's detail page to see how its stats trend over time."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {series.map((s) => (
            <Link key={s.id} href={`/series/${s.id}`}>
              <Card className="transition-colors hover:bg-muted/40">
                <CardHeader>
                  <CardTitle className="text-base">{s.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-1">
                  {s.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {s.reelCount} reel{s.reelCount === 1 ? "" : "s"} · since{" "}
                    {formatDate(s.startDate)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
