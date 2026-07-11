import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL || "postgresql://localhost:5432/excellantia";
const pool = new Pool({ 
  connectionString,
  ssl: process.env.NODE_ENV === "production" ? undefined : { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);

// On force la recréation de l'instance en mode développement pour éviter que l'ancienne 
// instance (sans adaptateur ou ancienne config SSL) soit utilisée par le cache HMR de Next.js
if (process.env.NODE_ENV !== "production") {
  delete (globalThis as any).prisma;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
