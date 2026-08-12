import { db } from "@/lib/db";

export interface DnaGroupStat {
  key: string;
  avgViews: number;
  count: number;
}

export async function getLatestContentDna() {
  const profile = await db.contentDnaProfile.findFirst({ orderBy: { generatedAt: "desc" } });
  if (!profile) return null;

  return {
    ...profile,
    topFormats: JSON.parse(profile.topFormatsJson) as DnaGroupStat[],
    topTopics: JSON.parse(profile.topTopicsJson) as DnaGroupStat[],
  };
}
