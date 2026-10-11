-- Introduces real multi-user accounts (email + password), replacing the
-- single shared-password gate this app used to run behind. Every table
-- that used to implicitly belong to "the one creator using this app" now
-- belongs to a specific User instead.
--
-- This runs via `prisma migrate deploy` on an existing production
-- database that may already have real data in it (one creator's synced
-- reels, posts, follower history, etc.) - so adding a required userId
-- column can't just be a plain ADD COLUMN NOT NULL, or deploy would fail
-- outright against any table with existing rows. Instead: add the column
-- nullable, backfill it, then tighten to NOT NULL - three steps, same
-- transaction.
--
-- The backfill creates one "unclaimed" User (passwordHash left NULL) for
-- whatever Account row already exists, using that Instagram account's
-- own username rather than a real email address (not known to this
-- migration, and not something to hardcode into source control anyway).
-- The person who owns that data claims it by signing up with the email
-- <their-instagram-username>@placeholder.local - signup treats a matching
-- unclaimed email as "set the password on this existing row" rather than
-- a duplicate-email rejection. See src/app/api/auth/signup/route.ts.
-- On a fresh/empty database this whole block is a no-op.

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AlterTable (nullable for now - backfilled below, then tightened)
ALTER TABLE "Account" ADD COLUMN "userId" TEXT;
ALTER TABLE "FollowerSnapshot" ADD COLUMN "userId" TEXT;
ALTER TABLE "Reel" ADD COLUMN "userId" TEXT;
ALTER TABLE "Series" ADD COLUMN "userId" TEXT;
ALTER TABLE "AgentDefinition" ADD COLUMN "userId" TEXT;
ALTER TABLE "AgentSettings" ADD COLUMN "userId" TEXT;
ALTER TABLE "Suggestion" ADD COLUMN "userId" TEXT;
ALTER TABLE "ContentDnaProfile" ADD COLUMN "userId" TEXT;
ALTER TABLE "BestPractice" ADD COLUMN "userId" TEXT;
ALTER TABLE "IdeaBatch" ADD COLUMN "userId" TEXT;
ALTER TABLE "DmThread" ADD COLUMN "userId" TEXT;
ALTER TABLE "Post" ADD COLUMN "userId" TEXT;
ALTER TABLE "DraftReel" ADD COLUMN "userId" TEXT;
ALTER TABLE "CalendarEntry" ADD COLUMN "userId" TEXT;
ALTER TABLE "DailyReport" ADD COLUMN "userId" TEXT;

-- Backfill: one unclaimed bootstrap User for any pre-existing data.
DO $$
DECLARE
  bootstrap_user_id TEXT;
  existing_username TEXT;
BEGIN
  SELECT username INTO existing_username FROM "Account" LIMIT 1;

  IF existing_username IS NOT NULL THEN
    bootstrap_user_id := gen_random_uuid()::text;

    INSERT INTO "User" (id, email, "passwordHash", "createdAt")
    VALUES (bootstrap_user_id, existing_username || '@placeholder.local', NULL, now());

    UPDATE "Account" SET "userId" = bootstrap_user_id;
    UPDATE "FollowerSnapshot" SET "userId" = bootstrap_user_id;
    UPDATE "Reel" SET "userId" = bootstrap_user_id;
    UPDATE "Series" SET "userId" = bootstrap_user_id;
    UPDATE "AgentDefinition" SET "userId" = bootstrap_user_id;
    UPDATE "AgentSettings" SET "userId" = bootstrap_user_id;
    UPDATE "Suggestion" SET "userId" = bootstrap_user_id;
    UPDATE "ContentDnaProfile" SET "userId" = bootstrap_user_id;
    UPDATE "BestPractice" SET "userId" = bootstrap_user_id;
    UPDATE "IdeaBatch" SET "userId" = bootstrap_user_id;
    UPDATE "DmThread" SET "userId" = bootstrap_user_id;
    UPDATE "Post" SET "userId" = bootstrap_user_id;
    UPDATE "DraftReel" SET "userId" = bootstrap_user_id;
    UPDATE "CalendarEntry" SET "userId" = bootstrap_user_id;
    UPDATE "DailyReport" SET "userId" = bootstrap_user_id;
  END IF;
END $$;

-- Tighten to NOT NULL now that every existing row has a value.
ALTER TABLE "Account" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "FollowerSnapshot" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Reel" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Series" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "AgentDefinition" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "AgentSettings" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Suggestion" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "ContentDnaProfile" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "BestPractice" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "IdeaBatch" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "DmThread" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Post" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "DraftReel" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "CalendarEntry" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "DailyReport" ALTER COLUMN "userId" SET NOT NULL;

-- DropIndex (AgentDefinition.key was globally unique; now unique per user)
DROP INDEX "AgentDefinition_key_key";

-- DropIndex (DM thread/message ids were globally unique; now unique per
-- user/thread - two CMPND users can DM the same person, or each other)
DROP INDEX "DmThread_igThreadId_key";
DROP INDEX "DmMessage_igMessageId_key";
CREATE UNIQUE INDEX "DmThread_userId_igThreadId_key" ON "DmThread"("userId", "igThreadId");
CREATE UNIQUE INDEX "DmMessage_threadId_igMessageId_key" ON "DmMessage"("threadId", "igMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_key" ON "Account"("userId");
CREATE INDEX "FollowerSnapshot_userId_idx" ON "FollowerSnapshot"("userId");
CREATE INDEX "Reel_userId_idx" ON "Reel"("userId");
CREATE INDEX "Series_userId_idx" ON "Series"("userId");
CREATE UNIQUE INDEX "AgentDefinition_userId_key_key" ON "AgentDefinition"("userId", "key");
CREATE UNIQUE INDEX "AgentSettings_userId_key" ON "AgentSettings"("userId");
CREATE INDEX "Suggestion_userId_idx" ON "Suggestion"("userId");
CREATE INDEX "ContentDnaProfile_userId_idx" ON "ContentDnaProfile"("userId");
CREATE INDEX "BestPractice_userId_idx" ON "BestPractice"("userId");
CREATE INDEX "IdeaBatch_userId_idx" ON "IdeaBatch"("userId");
CREATE INDEX "DmThread_userId_idx" ON "DmThread"("userId");
CREATE INDEX "Post_userId_idx" ON "Post"("userId");
CREATE INDEX "DraftReel_userId_idx" ON "DraftReel"("userId");
CREATE INDEX "CalendarEntry_userId_idx" ON "CalendarEntry"("userId");
CREATE INDEX "DailyReport_userId_idx" ON "DailyReport"("userId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FollowerSnapshot" ADD CONSTRAINT "FollowerSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Reel" ADD CONSTRAINT "Reel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Series" ADD CONSTRAINT "Series_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentDefinition" ADD CONSTRAINT "AgentDefinition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentSettings" ADD CONSTRAINT "AgentSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentDnaProfile" ADD CONSTRAINT "ContentDnaProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BestPractice" ADD CONSTRAINT "BestPractice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IdeaBatch" ADD CONSTRAINT "IdeaBatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DmThread" ADD CONSTRAINT "DmThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DraftReel" ADD CONSTRAINT "DraftReel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CalendarEntry" ADD CONSTRAINT "CalendarEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyReport" ADD CONSTRAINT "DailyReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
