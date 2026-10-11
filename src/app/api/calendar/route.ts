import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId, unauthorized } from "@/lib/session";

const VALID_CONTENT_TYPES = new Set(["reel", "post", "story"]);

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const body = await request.json();

  if (!body.date || typeof body.date !== "string") {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }
  if (!VALID_CONTENT_TYPES.has(body.contentType)) {
    return NextResponse.json({ error: "contentType must be 'reel', 'post', or 'story'" }, { status: 400 });
  }
  if (!body.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  // Only link a source suggestion the caller actually owns - otherwise
  // the id is dropped rather than stored as a dangling cross-user link.
  const sourceSuggestion =
    typeof body.sourceSuggestionId === "string"
      ? await db.suggestion.findFirst({ where: { id: body.sourceSuggestionId, userId } })
      : null;

  const entry = await db.calendarEntry.create({
    data: {
      userId,
      date: new Date(body.date),
      contentType: body.contentType,
      title: body.title,
      notes: typeof body.notes === "string" ? body.notes : null,
      sourceSuggestionId: sourceSuggestion?.id ?? null,
    },
  });

  if (sourceSuggestion) {
    await db.suggestion.update({
      where: { id: sourceSuggestion.id },
      data: { status: "used" },
    });
  }

  return NextResponse.json(entry);
}
