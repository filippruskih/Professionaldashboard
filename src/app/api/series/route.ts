import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId, unauthorized } from "@/lib/session";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const body = await request.json();

  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const series = await db.series.create({
    data: {
      userId,
      name: body.name,
      description: body.description || null,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
    },
  });

  return NextResponse.json(series);
}
