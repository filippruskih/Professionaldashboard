import { db } from "@/lib/db";

// 3 reel suggestions + 1 post suggestion per Planning run (see
// src/lib/agents/tasks/planning.ts).
const MAX_ACTIVE_SUGGESTIONS = 4;

export async function getActiveSuggestions() {
  return db.suggestion.findMany({
    where: { status: "new" },
    orderBy: { date: "desc" },
    take: MAX_ACTIVE_SUGGESTIONS,
  });
}
