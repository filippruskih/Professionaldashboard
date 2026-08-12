-- CreateTable
CREATE TABLE "ContentDnaProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "narrative" TEXT NOT NULL,
    "topFormatsJson" TEXT NOT NULL,
    "topTopicsJson" TEXT NOT NULL,
    "sourceAgentRunId" TEXT
);
