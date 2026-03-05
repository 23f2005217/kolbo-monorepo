import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = `${process.env.DATABASE_URL}`;
const isProduction = process.env.NODE_ENV === "production";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Force refresh if model is missing (happens after schema updates in dev)
if (process.env.NODE_ENV !== "production" && globalForPrisma.prisma) {
  // We can't easily check for relations, but we can check if the client reflects the latest schema by checking for a known field or just resetting once.
  // @ts-ignore - this is just a dev hack
  globalForPrisma.prisma = undefined;
}

// Use a global pool to prevent multiple pools during HMR or re-execution
// In serverless (Vercel), max=1 because each lambda is single-threaded
// In development, use higher pool size for better concurrency
const pool = globalForPrisma.pool ?? new Pool({
  connectionString,
  max: isProduction ? 1 : 5, // 1 connection per serverless lambda, 5 for local dev
});

globalForPrisma.pool = pool;

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: isProduction ? ["error"] : ["query", "error", "warn"],
  });

globalForPrisma.prisma = prisma;

export default prisma;