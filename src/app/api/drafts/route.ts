import path from "node:path";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { draftStoragePath, saveDraftFile } from "@/lib/video/draft-storage";
import { processDraftReel } from "@/lib/video/analyze-draft";

const MAX_UPLOAD_BYTES = 300 * 1024 * 1024;

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("video");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No video file provided" }, { status: 400 });
  }
  if (!file.type.startsWith("video/")) {
    return NextResponse.json({ error: "File must be a video" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Video is too large (max 300MB)" }, { status: 413 });
  }

  const draft = await db.draftReel.create({
    data: { filename: file.name || "draft.mp4", storagePath: "", status: "uploaded" },
  });

  const extension = path.extname(file.name) || ".mp4";
  const storagePath = draftStoragePath(draft.id, extension);
  const buffer = Buffer.from(await file.arrayBuffer());
  await saveDraftFile(storagePath, buffer);
  await db.draftReel.update({ where: { id: draft.id }, data: { storagePath } });

  processDraftReel(draft.id).catch((error) => {
    console.error(`[scanner] draft ${draft.id} processing crashed`, error);
  });

  return NextResponse.json({ id: draft.id });
}
