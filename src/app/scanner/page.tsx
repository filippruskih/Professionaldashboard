import { ScanSearch } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ContentTabs } from "@/components/content-tabs";
import { UploadForm } from "@/components/scanner/upload-form";
import { DraftList } from "@/components/scanner/draft-list";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

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
        description="Upload a draft reel for frame-by-frame feedback, a recommended hook, and a caption — before you post it."
      />

      <ContentTabs active="scanner" />

      <UploadForm />

      {drafts.length > 0 && <DraftList drafts={drafts} />}
    </div>
  );
}
