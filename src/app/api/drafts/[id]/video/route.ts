import path from "node:path";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { draftFileExists, readDraftFile } from "@/lib/video/draft-storage";

const MIME_BY_EXTENSION: Record<string, string> = {
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
  ".m4v": "video/x-m4v",
};

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const draft = await db.draftReel.findUnique({ where: { id } });
  if (!draft || !(await draftFileExists(draft.storagePath))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = await readDraftFile(draft.storagePath);
  const contentType = MIME_BY_EXTENSION[path.extname(draft.storagePath)] || "video/mp4";

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(buffer.length),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
