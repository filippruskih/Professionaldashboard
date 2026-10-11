import { db } from "@/lib/db";

export interface IdeaItem {
  concept: string;
  why: string;
}

export async function getLatestIdeaBatch(userId: string) {
  const batch = await db.ideaBatch.findFirst({ where: { userId }, orderBy: { generatedAt: "desc" } });
  if (!batch) return null;

  return {
    ...batch,
    nicheIdeas: JSON.parse(batch.nicheIdeasJson) as IdeaItem[],
    freshIdeas: JSON.parse(batch.freshIdeasJson) as IdeaItem[],
  };
}
