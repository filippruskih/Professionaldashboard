import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { DraftDetail } from "@/components/scanner/draft-detail";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ScannerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const draft = await db.draftReel.findUnique({ where: { id } });
  if (!draft) notFound();

  return (
    <div className="flex flex-1 flex-col gap-4">
      <BackLink href="/scanner" label="Scanner" />
      <DraftDetail
        initial={{
          id: draft.id,
          filename: draft.filename,
          status: draft.status,
          error: draft.error,
          analysis: draft.analysisJson ? JSON.parse(draft.analysisJson) : null,
        }}
      />
    </div>
  );
}
