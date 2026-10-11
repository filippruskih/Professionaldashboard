import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId, notFound, unauthorized } from "@/lib/session";

const VALID_STATUSES = new Set(["sent", "dismissed", "none"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const { id } = await params;
  const body = await request.json();

  if (!VALID_STATUSES.has(body.draftStatus)) {
    return NextResponse.json({ error: "Invalid draftStatus" }, { status: 400 });
  }

  const { count } = await db.dmThread.updateMany({
    where: { id, userId },
    data: { draftStatus: body.draftStatus },
  });
  if (count === 0) return notFound();
  return NextResponse.json({ ok: true });
}
