import { db } from "@/lib/db";

export async function getDmThreads(userId: string) {
  return db.dmThread.findMany({
    where: { userId },
    orderBy: { lastMessageAt: "desc" },
    include: { messages: { orderBy: { sentAt: "asc" } } },
  });
}
