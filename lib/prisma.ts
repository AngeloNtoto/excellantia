import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// ─── Singleton Pattern robuste pour Prisma & PostgreSQL Pool ────────────────
// Évite la multiplication des pools de connexion lors des rechargements Next.js (HMR)

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

const rawConnectionString = process.env.DATABASE_URL || "postgresql://localhost:5432/excellantia";
const connectionUrl = new URL(rawConnectionString);

if (["prefer", "require", "verify-ca"].includes(connectionUrl.searchParams.get("sslmode") ?? "")) {
  connectionUrl.searchParams.set("sslmode", "verify-full");
}

const connectionString = connectionUrl.toString();

if (!globalForPrisma.pgPool) {
  globalForPrisma.pgPool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
  });
}

const adapter = new PrismaPg(globalForPrisma.pgPool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
