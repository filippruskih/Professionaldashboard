import Link from "next/link";
import { ListTree } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBadge } from "@/components/icon-badge";
import { PageHeader } from "@/components/page-header";
import { ContentTabs } from "@/components/content-tabs";
import { NewSeriesDialog } from "@/components/series/new-series-dialog";
import { getAllSeries } from "@/lib/series";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SeriesPage() {
  const series = await getAllSeries();

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        icon={ListTree}
        color="yellow"
        title="Series"
        description={
          'Group reels into a series, like "Account Growth Journey", and track its stats from the start.'
        }
        action={<NewSeriesDialog />}
      />

      <ContentTabs active="series" />

      {series.length === 0 ? (
        <EmptyState
          icon={ListTree}
          color="yellow"
          title="No series yet"
          description="Create a series and tag reels into it from each reel's detail page to see how its stats trend over time."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {series.map((s) => (
            <Link key={s.id} href={`/series/${s.id}`}>
              <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <IconBadge icon={ListTree} color="yellow" size="sm" />
                    <CardTitle className="text-base">{s.name}</CardTitle>
                  </div>
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
