// One-time data migration: copies rows from the old local SQLite dev.db
// into the new Postgres database, preserving IDs and timestamps.
//
// Usage (after `npx prisma migrate deploy` has created empty tables on the
// target Postgres database):
//   DATABASE_URL="postgres://..." node scripts/migrate-sqlite-to-postgres.mjs [path/to/dev.db]
//
// Safe to delete this file after running it once.

import { DatabaseSync } from "node:sqlite";
import pg from "pg";

const sqlitePath = process.argv[2] ?? "prisma/dev.db";
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required (target Postgres connection string).");
  process.exit(1);
}

const sqlite = new DatabaseSync(sqlitePath, { readOnly: true });
const pool = new pg.Pool({ connectionString: databaseUrl });

function readAll(table) {
  return sqlite.prepare(`SELECT * FROM "${table}"`).all();
}

async function copyTable(table, columns, { boolColumns = [], dateColumns = [] } = {}) {
  const rows = readAll(table);
  if (rows.length === 0) {
    console.log(`${table}: 0 rows, skipping`);
    return;
  }

  const colList = columns.map((c) => `"${c}"`).join(", ");
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
  const insertSql = `INSERT INTO "${table}" (${colList}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`;

  for (const row of rows) {
    const values = columns.map((col) => {
      let value = row[col];
      if (value == null) return null;
      if (boolColumns.includes(col)) return value === 1 || value === true;
      if (dateColumns.includes(col)) return new Date(value);
      return value;
    });
    await pool.query(insertSql, values);
  }
  console.log(`${table}: copied ${rows.length} rows`);
}

async function main() {
  // Order respects foreign keys: parents before children.
  await copyTable("Account", [
    "id", "igUserId", "username", "accountType", "accessToken",
    "tokenExpiresAt", "connectedAt", "updatedAt",
  ], { dateColumns: ["tokenExpiresAt", "connectedAt", "updatedAt"] });

  await copyTable("FollowerSnapshot", [
    "id", "capturedAt", "followerCount", "followsCount", "mediaCount",
  ], { dateColumns: ["capturedAt"] });

  await copyTable("Series", ["id", "name", "description", "startDate", "createdAt"], {
    dateColumns: ["startDate", "createdAt"],
  });

  await copyTable("Reel", [
    "id", "igMediaId", "permalink", "caption", "postedAt", "thumbnailUrl",
    "mediaProductType", "format", "topicTags", "seriesId", "createdAt", "updatedAt",
  ], { dateColumns: ["postedAt", "createdAt", "updatedAt"] });

  await copyTable("ReelInsightSnapshot", [
    "id", "reelId", "capturedAt", "views", "likes", "comments", "shares",
    "saved", "reach", "totalInteractions", "avgWatchTimeMs", "skipRate3s", "engagementRate",
  ], { dateColumns: ["capturedAt"] });

  await copyTable("AgentDefinition", [
    "id", "key", "name", "description", "schedule", "enabled", "createdAt",
  ], { boolColumns: ["enabled"], dateColumns: ["createdAt"] });

  await copyTable("AgentRun", [
    "id", "agentId", "status", "startedAt", "finishedAt", "outputSummary",
  ], { dateColumns: ["startedAt", "finishedAt"] });

  await copyTable("AgentLogEntry", ["id", "runId", "timestamp", "level", "message"], {
    dateColumns: ["timestamp"],
  });

  await copyTable("Suggestion", [
    "id", "date", "hook", "script", "sourceAgentRunId", "status", "createdAt",
  ], { dateColumns: ["date", "createdAt"] });

  await copyTable("ContentDnaProfile", [
    "id", "generatedAt", "narrative", "topFormatsJson", "topTopicsJson", "sourceAgentRunId",
  ], { dateColumns: ["generatedAt"] });

  await copyTable("DmThread", [
    "id", "igThreadId", "participantUsername", "category", "draftReply",
    "draftStatus", "lastMessageAt", "createdAt", "updatedAt",
  ], { dateColumns: ["lastMessageAt", "createdAt", "updatedAt"] });

  await copyTable("DmMessage", ["id", "threadId", "igMessageId", "fromUser", "text", "sentAt"], {
    boolColumns: ["fromUser"],
    dateColumns: ["sentAt"],
  });

  await copyTable("Post", [
    "id", "igMediaId", "permalink", "caption", "postedAt", "thumbnailUrl",
    "mediaType", "topicTags", "createdAt", "updatedAt",
  ], { dateColumns: ["postedAt", "createdAt", "updatedAt"] });

  await copyTable("PostInsightSnapshot", [
    "id", "postId", "capturedAt", "views", "likes", "comments", "shares",
    "saved", "reach", "totalInteractions", "engagementRate",
  ], { dateColumns: ["capturedAt"] });

  await pool.end();
  sqlite.close();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
