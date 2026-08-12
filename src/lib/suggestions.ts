import { db } from "@/lib/db";

export async function getActiveSuggestion() {
  return db.suggestion.findFirst({
    where: { status: "new" },
    orderBy: { date: "desc" },
  });
}
