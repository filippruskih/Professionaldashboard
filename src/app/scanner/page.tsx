import { ScanSearch } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { DraftList } from "@/components/scanner/draft-list";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Reached via the "+" button's dialog on any page (that's the primary
// upload entry point now — see ScannerUploadDialog) or the back-link from
// a scan's result page. This page itself is just the history of past scans.
export default async function ScannerPage() {
  const drafts = await db.draftReel.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, filename: true, status: true, createdAt: true },
  });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        icon={ScanSearch}
        color="orange"
        title="Scanner"
        description="Past draft reels you've scanned — tap the + in the bottom bar to scan a new one."
      />

      {drafts.length === 0 ? (
        <EmptyState
          icon={ScanSearch}
          color="orange"
          title="No scans yet"
          description="Tap the + button in the bottom bar to upload an in-progress reel for frame-by-frame feedback, a recommended hook, and a caption."
        />
      ) : (
        <DraftList drafts={drafts} />
      )}
    </div>
  );
}
