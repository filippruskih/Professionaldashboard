import { db } from "@/lib/db";

export async function getDmThreads() {
  return db.dmThread.findMany({
    orderBy: { lastMessageAt: "desc" },
    include: { messages: { orderBy: { sentAt: "asc" } } },
  });
}
