-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "igUserId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "accountType" TEXT,
    "accessToken" TEXT NOT NULL,
    "tokenExpiresAt" DATETIME NOT NULL,
    "connectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FollowerSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followerCount" INTEGER NOT NULL,
    "followsCount" INTEGER NOT NULL,
    "mediaCount" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Reel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "igMediaId" TEXT NOT NULL,
    "permalink" TEXT NOT NULL,
    "caption" TEXT,
    "postedAt" DATETIME NOT NULL,
    "thumbnailUrl" TEXT,
    "mediaProductType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ReelInsightSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reelId" TEXT NOT NULL,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER,
    "likes" INTEGER,
    "comments" INTEGER,
    "shares" INTEGER,
    "saved" INTEGER,
    "reach" INTEGER,
    "totalInteractions" INTEGER,
    "avgWatchTimeMs" INTEGER,
    "skipRate3s" REAL,
    "engagementRate" REAL,
    CONSTRAINT "ReelInsightSnapshot_reelId_fkey" FOREIGN KEY ("reelId") REFERENCES "Reel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_igUserId_key" ON "Account"("igUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Reel_igMediaId_key" ON "Reel"("igMediaId");

-- CreateIndex
CREATE INDEX "ReelInsightSnapshot_reelId_idx" ON "ReelInsightSnapshot"("reelId");
