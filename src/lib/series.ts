import { db } from "@/lib/db";

export async function getAllSeries(userId: string) {
  const series = await db.series.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
    include: { reels: { select: { id: true } } },
  });
  return series.map((s) => ({ ...s, reelCount: s.reels.length }));
}

export async function getSeriesDetail(userId: string, id: string) {
  const series = await db.series.findFirst({
    where: { id, userId },
    include: {
      reels: {
        // Redundant with the series itself being userId-scoped above, but
        // cheap insurance in case a reel ever ends up attached to someone
        // else's series through a path that didn't check ownership.
        where: { userId },
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
