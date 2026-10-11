import { db } from "@/lib/db";

// One row per user, created lazily on first read rather than via a seed
// script.
export async function getAgentSettings(userId: string) {
  return db.agentSettings.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export function parseExcludedTopics(excludedTopics: string | null): string[] {
  if (!excludedTopics) return [];
  return excludedTopics
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
