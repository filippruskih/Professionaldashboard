import { db } from "@/lib/db";

export async function getAllSeries() {
  const series = await db.series.findMany({
    orderBy: { startDate: "desc" },
    include: { reels: { select: { id: true } } },
  });
  return series.map((s) => ({ ...s, reelCount: s.reels.length }));
}

export async function getSeriesDetail(id: string) {
  const series = await db.series.findUnique({
    where: { id },
    include: {
      reels: {
        orderBy: { postedAt: "asc" },
        include: { insights: { orderBy: { capturedAt: "desc" }, take: 1 } },
      },
    },
  });
  if (!series) return null;

  return {
    ...series,
    reels: series.reels.map((reel) => ({ ...reel, latestInsight: reel.insights[0] ?? null })),
  };
}
