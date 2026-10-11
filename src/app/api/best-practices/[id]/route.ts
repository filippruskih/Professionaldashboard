import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId, notFound, unauthorized } from "@/lib/session";

const VALID_STATUSES = new Set(["done", "dismissed"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const { id } = await params;
  const body = await request.json();

  if (!VALID_STATUSES.has(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { count } = await db.bestPractice.updateMany({
    where: { id, userId },
    data: { status: body.status, resolvedAt: new Date() },
  });
  if (count === 0) return notFound();
  return NextResponse.json({ ok: true });
}
