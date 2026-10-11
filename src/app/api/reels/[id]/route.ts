import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId, notFound, unauthorized } from "@/lib/session";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const { id } = await params;
  const body = await request.json();

  if (!("seriesId" in body)) {
    return NextResponse.json({ error: "seriesId is required (string or null)" }, { status: 400 });
  }

  // Both ends have to be the caller's own - their reel, into their series.
  if (body.seriesId !== null) {
    const series = await db.series.findFirst({ where: { id: String(body.seriesId), userId } });
    if (!series) return notFound();
  }

  const { count } = await db.reel.updateMany({
    where: { id, userId },
    data: { seriesId: body.seriesId },
  });
  if (count === 0) return notFound();

  return NextResponse.json({ ok: true });
}
