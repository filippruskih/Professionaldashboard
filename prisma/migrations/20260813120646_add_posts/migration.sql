-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "igMediaId" TEXT NOT NULL,
    "permalink" TEXT NOT NULL,
    "caption" TEXT,
    "postedAt" DATETIME NOT NULL,
    "thumbnailUrl" TEXT,
    "mediaType" TEXT NOT NULL,
    "topicTags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PostInsightSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER,
    "likes" INTEGER,
    "comments" INTEGER,
    "shares" INTEGER,
    "saved" INTEGER,
    "reach" INTEGER,
    "totalInteractions" INTEGER,
    "engagementRate" REAL,
    CONSTRAINT "PostInsightSnapshot_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_igMediaId_key" ON "Post"("igMediaId");

-- CreateIndex
CREATE INDEX "PostInsightSnapshot_postId_idx" ON "PostInsightSnapshot"("postId");
