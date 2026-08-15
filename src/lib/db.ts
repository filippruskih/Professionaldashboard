import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Deliberately not validated eagerly here: this module is imported by every
// route (including ones Next statically analyzes at build time), and an
// eager throw on a missing/unset DATABASE_URL would fail the build itself.
// A bad or missing connection string surfaces instead the first time a
// query actually runs.
//
// onPoolError/onConnectionError are required in production: node-postgres's
// underlying Pool crashes the whole Node process on an unhandled 'error'
// event from a background/idle connection (e.g. the host closing an idle
// connection) — a well-known footgun. Without these, a transient DB hiccup
// takes the entire app down instead of just failing the one query.
const adapter = new PrismaPg(
  { connectionString: process.env.DATABASE_URL },
  {
    onPoolError: (err) => console.error("[db] pool error", err),
    onConnectionError: (err) => console.error("[db] connection error", err),
  }
);

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
