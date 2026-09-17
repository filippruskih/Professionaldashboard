-- AlterTable
ALTER TABLE "Suggestion" ADD COLUMN     "caption" TEXT,
ADD COLUMN     "concept" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'reel',
ALTER COLUMN "hook" DROP NOT NULL,
ALTER COLUMN "script" DROP NOT NULL;

