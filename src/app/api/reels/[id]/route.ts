import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  if (!("seriesId" in body)) {
    return NextResponse.json({ error: "seriesId is required (string or null)" }, { status: 400 });
  }

  await db.reel.update({
    where: { id },
    data: { seriesId: body.seriesId },
  });

  return NextResponse.json({ ok: true });
}
