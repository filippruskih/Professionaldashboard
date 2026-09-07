import { Film } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ReelsGrid } from "@/components/reels/reels-grid";
import { PaginationControls } from "@/components/reels/pagination-controls";
import { ContentTabs } from "@/components/content-tabs";
import { getReelsPage } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function ReelsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1") || 1);
  const { reels, totalCount, pageSize } = await getReelsPage(page);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        icon={Film}
        color="orange"
        title="Reels"
        description="Every reel, with captions, views, engagement, and a link back to Instagram."
      />

      <ContentTabs active="reels" />

      {reels.length === 0 ? (
        <EmptyState
          icon={Film}
          color="orange"
          title="No reels synced yet"
          description="Connect your account in Settings and run a sync to see your reels here, with a detail page and feedback-loop comparisons for each one."
        />
      ) : (
        <>
          <ReelsGrid reels={reels} />
          <PaginationControls page={page} totalPages={totalPages} basePath="/reels" />
        </>
      )}
    </div>
  );
}
