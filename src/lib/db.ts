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
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
