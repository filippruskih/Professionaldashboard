import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deleteDraftFile } from "@/lib/video/draft-storage";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const draft = await db.draftReel.findUnique({ where: { id } });
  if (!draft) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: draft.id,
    filename: draft.filename,
    status: draft.status,
    error: draft.error,
    analysis: draft.analysisJson ? JSON.parse(draft.analysisJson) : null,
    createdAt: draft.createdAt,
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const draft = await db.draftReel.findUnique({ where: { id } });
  if (!draft) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await deleteDraftFile(draft.storagePath);
  await db.draftReel.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
