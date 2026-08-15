-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "igUserId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "accountType" TEXT,
    "accessToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowerSnapshot" (
    "id" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followerCount" INTEGER NOT NULL,
    "followsCount" INTEGER NOT NULL,
    "mediaCount" INTEGER NOT NULL,

    CONSTRAINT "FollowerSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reel" (
    "id" TEXT NOT NULL,
    "igMediaId" TEXT NOT NULL,
    "permalink" TEXT NOT NULL,
    "caption" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL,
    "thumbnailUrl" TEXT,
    "mediaProductType" TEXT,
    "format" TEXT,
    "topicTags" TEXT,
    "seriesId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Series" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReelInsightSnapshot" (
    "id" TEXT NOT NULL,
    "reelId" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER,
    "likes" INTEGER,
    "comments" INTEGER,
    "shares" INTEGER,
    "saved" INTEGER,
    "reach" INTEGER,
    "totalInteractions" INTEGER,
    "avgWatchTimeMs" INTEGER,
    "skipRate3s" DOUBLE PRECISION,
    "engagementRate" DOUBLE PRECISION,

    CONSTRAINT "ReelInsightSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentDefinition" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "outputSummary" TEXT,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentLogEntry" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "AgentLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suggestion" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hook" TEXT NOT NULL,
    "script" TEXT NOT NULL,
    "sourceAgentRunId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Suggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentDnaProfile" (
    "id" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "narrative" TEXT NOT NULL,
    "topFormatsJson" TEXT NOT NULL,
    "topTopicsJson" TEXT NOT NULL,
    "sourceAgentRunId" TEXT,

    CONSTRAINT "ContentDnaProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DmThread" (
    "id" TEXT NOT NULL,
    "igThreadId" TEXT NOT NULL,
    "participantUsername" TEXT,
    "category" TEXT,
    "draftReply" TEXT,
    "draftStatus" TEXT NOT NULL DEFAULT 'none',
    "lastMessageAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DmThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DmMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "igMessageId" TEXT NOT NULL,
    "fromUser" BOOLEAN NOT NULL,
    "text" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DmMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "igMediaId" TEXT NOT NULL,
    "permalink" TEXT NOT NULL,
    "caption" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL,
    "thumbnailUrl" TEXT,
    "mediaType" TEXT NOT NULL,
    "topicTags" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostInsightSnapshot" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER,
    "likes" INTEGER,
    "comments" INTEGER,
    "shares" INTEGER,
    "saved" INTEGER,
    "reach" INTEGER,
    "totalInteractions" INTEGER,
    "engagementRate" DOUBLE PRECISION,

    CONSTRAINT "PostInsightSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_igUserId_key" ON "Account"("igUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Reel_igMediaId_key" ON "Reel"("igMediaId");

-- CreateIndex
CREATE INDEX "Reel_seriesId_idx" ON "Reel"("seriesId");

-- CreateIndex
CREATE INDEX "ReelInsightSnapshot_reelId_idx" ON "ReelInsightSnapshot"("reelId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentDefinition_key_key" ON "AgentDefinition"("key");

-- CreateIndex
CREATE INDEX "AgentRun_agentId_idx" ON "AgentRun"("agentId");

-- CreateIndex
CREATE INDEX "AgentLogEntry_runId_idx" ON "AgentLogEntry"("runId");

-- CreateIndex
CREATE UNIQUE INDEX "DmThread_igThreadId_key" ON "DmThread"("igThreadId");

-- CreateIndex
CREATE UNIQUE INDEX "DmMessage_igMessageId_key" ON "DmMessage"("igMessageId");

-- CreateIndex
CREATE INDEX "DmMessage_threadId_idx" ON "DmMessage"("threadId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_igMediaId_key" ON "Post"("igMediaId");

-- CreateIndex
CREATE INDEX "PostInsightSnapshot_postId_idx" ON "PostInsightSnapshot"("postId");

-- AddForeignKey
ALTER TABLE "Reel" ADD CONSTRAINT "Reel_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReelInsightSnapshot" ADD CONSTRAINT "ReelInsightSnapshot_reelId_fkey" FOREIGN KEY ("reelId") REFERENCES "Reel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentLogEntry" ADD CONSTRAINT "AgentLogEntry_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AgentRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DmMessage" ADD CONSTRAINT "DmMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "DmThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostInsightSnapshot" ADD CONSTRAINT "PostInsightSnapshot_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

