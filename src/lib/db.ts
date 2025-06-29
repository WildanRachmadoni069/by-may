import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// Buat URL database dengan optimasi connection pooling untuk Vercel
const getDatabaseUrl = () => {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) return baseUrl;

  // Untuk production build, tambahkan parameter connection pooling yang konservatif
  if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
    const url = new URL(baseUrl);
    url.searchParams.set("connection_limit", "1");
    url.searchParams.set("pool_timeout", "20");
    url.searchParams.set("sslmode", "require");
    return url.toString();
  }

  return baseUrl;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export default db;
