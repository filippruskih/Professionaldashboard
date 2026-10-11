import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId, notFound, unauthorized } from "@/lib/session";

const VALID_STATUSES = new Set(["planned", "drafted", "posted", "skipped"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const { id } = await params;
  const body = await request.json();

  const data: { title?: string; notes?: string | null; status?: string; date?: Date } = {};

  if ("title" in body) {
    if (typeof body.title !== "string" || !body.title) {
      return NextResponse.json({ error: "title must be a non-empty string" }, { status: 400 });
    }
    data.title = body.title;
  }
  if ("notes" in body) {
    data.notes = typeof body.notes === "string" ? body.notes : null;
  }
  if ("status" in body) {
    if (!VALID_STATUSES.has(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = body.status;
  }
  if ("date" in body) {
    data.date = new Date(body.date);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { count } = await db.calendarEntry.updateMany({ where: { id, userId }, data });
  if (count === 0) return notFound();
  const entry = await db.calendarEntry.findUnique({ where: { id } });
  return NextResponse.json(entry);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const { id } = await params;
  const { count } = await db.calendarEntry.deleteMany({ where: { id, userId } });
  if (count === 0) return notFound();
  return NextResponse.json({ ok: true });
}
