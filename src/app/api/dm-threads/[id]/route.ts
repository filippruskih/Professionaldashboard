import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const VALID_STATUSES = new Set(["sent", "dismissed", "none"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  if (!VALID_STATUSES.has(body.draftStatus)) {
    return NextResponse.json({ error: "Invalid draftStatus" }, { status: 400 });
  }

  await db.dmThread.update({ where: { id }, data: { draftStatus: body.draftStatus } });
  return NextResponse.json({ ok: true });
}
