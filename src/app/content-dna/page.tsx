import { Dna } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { getLatestContentDna } from "@/lib/content-dna";
import { formatCompactNumber, formatDate } from "@/lib/format";
import { formatLabel } from "@/lib/content/classify";

export const dynamic = "force-dynamic";

export default async function ContentDnaPage() {
  const profile = await getLatestContentDna();

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        icon={Dna}
        color="aqua"
        title="Content DNA"
        description="The recurring hooks, topics, tone, and formats that make your best reels work."
      />

      {!profile ? (
        <EmptyState
          icon={Dna}
          color="aqua"
          title="Not enough history yet"
          description="Your Content DNA profile is built by the Analytics agent from your top-performing reels over time. It'll appear here once you have at least 5 reels synced and have run the Analytics agent."
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
              <p className="text-xs text-muted-foreground">
                Generated {formatDate(profile.generatedAt)} by the Analytics agent
              </p>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{profile.narrative}</p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Formats that outperform</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {profile.topFormats.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Not enough data yet.</p>
                ) : (
                  profile.topFormats.map((f) => (
                    <div key={f.key} className="flex items-center justify-between text-sm">
                      <Badge variant="secondary">{formatLabel(f.key)}</Badge>
                      <span className="text-muted-foreground">
                        {formatCompactNumber(f.avgViews)} avg plays · {f.count} reels
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Topics that outperform</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {profile.topTopics.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Not enough data yet.</p>
                ) : (
                  profile.topTopics.map((t) => (
                    <div key={t.key} className="flex items-center justify-between text-sm">
                      <Badge variant="outline">{t.key}</Badge>
                      <span className="text-muted-foreground">
                        {formatCompactNumber(t.avgViews)} avg plays · {t.count} reels
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
