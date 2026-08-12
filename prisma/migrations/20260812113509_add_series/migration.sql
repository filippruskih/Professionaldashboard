-- CreateTable
CREATE TABLE "Series" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "igMediaId" TEXT NOT NULL,
    "permalink" TEXT NOT NULL,
    "caption" TEXT,
    "postedAt" DATETIME NOT NULL,
    "thumbnailUrl" TEXT,
    "mediaProductType" TEXT,
    "format" TEXT,
    "topicTags" TEXT,
    "seriesId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reel_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Reel" ("caption", "createdAt", "format", "id", "igMediaId", "mediaProductType", "permalink", "postedAt", "thumbnailUrl", "topicTags", "updatedAt") SELECT "caption", "createdAt", "format", "id", "igMediaId", "mediaProductType", "permalink", "postedAt", "thumbnailUrl", "topicTags", "updatedAt" FROM "Reel";
DROP TABLE "Reel";
ALTER TABLE "new_Reel" RENAME TO "Reel";
CREATE UNIQUE INDEX "Reel_igMediaId_key" ON "Reel"("igMediaId");
CREATE INDEX "Reel_seriesId_idx" ON "Reel"("seriesId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
