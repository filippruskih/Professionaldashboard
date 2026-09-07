import { db } from "@/lib/db";

const MAX_ACTIVE_SUGGESTIONS = 3;

export async function getActiveSuggestions() {
  return db.suggestion.findMany({
    where: { status: "new" },
    orderBy: { date: "desc" },
    take: MAX_ACTIVE_SUGGESTIONS,
  });
}
