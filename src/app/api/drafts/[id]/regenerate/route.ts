import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { processDraftReel } from "@/lib/video/analyze-draft";

// Re-runs the same frame-extraction + Claude analysis from scratch against
// the already-uploaded video - used when the creator doesn't like the
// generated hook/caption/breakdown and wants a fresh pass instead of
// re-uploading.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const draft = await db.draftReel.findUnique({ where: { id } });
  if (!draft) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.draftReel.update({
    where: { id },
    data: { status: "processing", analysisJson: null, error: null },
  });

  processDraftReel(id).catch((error) => {
    console.error(`[scanner] draft ${id} regeneration crashed`, error);
  });

  return NextResponse.json({ ok: true });
}
