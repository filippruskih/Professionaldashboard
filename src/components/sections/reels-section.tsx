import Link from "next/link";
import { Film } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { SectionShell } from "@/components/section-shell";
import { ReelsTable } from "@/components/reels/reels-table";
import { Button } from "@/components/ui/button";
import { getReelsWithLatestInsights } from "@/lib/stats";

const RECENT_LIMIT = 10;

export async function ReelsSection() {
  const allReels = await getReelsWithLatestInsights();
  const reels = allReels.slice(0, RECENT_LIMIT);

  return (
    <SectionShell
      id="reels"
      icon={Film}
      color="orange"
      title="Reels"
      description="Every reel, with captions, views, engagement, and a link back to Instagram."
      action={
        allReels.length > 0 ? (
          <Button variant="outline" size="sm" asChild>
            <Link href="/reels">View all reels</Link>
          </Button>
        ) : undefined
      }
    >
      {reels.length === 0 ? (
        <EmptyState
          icon={Film}
          color="orange"
          title="No reels synced yet"
          description="Connect your account in Settings and run a sync to see your reels here, with a detail page and feedback-loop comparisons for each one."
        />
      ) : (
        <ReelsTable reels={reels} />
      )}
    </SectionShell>
  );
}
