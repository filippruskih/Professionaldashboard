-- CreateTable
CREATE TABLE "DmThread" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "igThreadId" TEXT NOT NULL,
    "participantUsername" TEXT,
    "category" TEXT,
    "draftReply" TEXT,
    "draftStatus" TEXT NOT NULL DEFAULT 'none',
    "lastMessageAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DmMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "threadId" TEXT NOT NULL,
    "igMessageId" TEXT NOT NULL,
    "fromUser" BOOLEAN NOT NULL,
    "text" TEXT,
    "sentAt" DATETIME NOT NULL,
    CONSTRAINT "DmMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "DmThread" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DmThread_igThreadId_key" ON "DmThread"("igThreadId");

-- CreateIndex
CREATE UNIQUE INDEX "DmMessage_igMessageId_key" ON "DmMessage"("igMessageId");

-- CreateIndex
CREATE INDEX "DmMessage_threadId_idx" ON "DmMessage"("threadId");
