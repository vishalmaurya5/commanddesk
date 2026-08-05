import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;

// Parse the connection string to handle SSL correctly for Supabase/Vercel
const isLocal = !connectionString || connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString,
  // Supabase requires SSL for remote connections.
  ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
  // Next dev reloads create many short-lived clients; without a cap the pool
  // exhausts Supabase's connection limit and every request starts queueing.
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});
const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  // "query" logging prints every statement and is a large dev-mode cost on
  // pages that fan out to many queries. Set PRISMA_LOG_QUERIES=1 to opt in.
  log:
    process.env.NODE_ENV === "development" && process.env.PRISMA_LOG_QUERIES === "1"
      ? ["query", "error", "warn"]
      : ["error"],
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
