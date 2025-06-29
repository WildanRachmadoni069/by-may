/**
 * Database client dengan manajemen koneksi yang ditingkatkan
 * Dirancang khusus untuk mengatasi keterbatasan connection pool Vercel
 */
import { PrismaClient } from "@/generated/prisma/client";
import { logError } from "./debug";

class DatabaseManager {
  private static instance: DatabaseManager;
  private client: PrismaClient | null = null;
  private isConnecting = false;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private createClient(): PrismaClient {
    const baseUrl = process.env.DATABASE_URL;
    if (!baseUrl) {
      throw new Error("DATABASE_URL tidak didefinisikan");
    }

    const getDatabaseUrl = () => {
      // Untuk production build di Vercel, gunakan connection pooling yang sangat konservatif
      if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
        const url = new URL(baseUrl);
        url.searchParams.set("connection_limit", "1");
        url.searchParams.set("pool_timeout", "30");
        url.searchParams.set("connect_timeout", "60");
        return url.toString();
      }
      return baseUrl;
    };

    return new PrismaClient({
      log:
        process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      datasources: {
        db: {
          url: getDatabaseUrl(),
        },
      },
    });
  }

  async getClient(): Promise<PrismaClient> {
    if (this.client) {
      return this.client;
    }

    if (this.isConnecting) {
      while (this.isConnecting) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (this.client) {
        return this.client;
      }
    }

    this.isConnecting = true;

    try {
      this.client = this.createClient();
      await this.client.$connect();
      logError("DatabaseManager", "Berhasil terhubung ke database");
      return this.client;
    } catch (error) {
      logError("DatabaseManager.getClient", error);
      this.client = null;
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.$disconnect();
      this.client = null;
    }
  }

  /**
   * Eksekusi query dengan retry logic dan manajemen koneksi
   */
  async executeWithRetry<T>(
    operation: (client: PrismaClient) => Promise<T>,
    maxRetries = 2,
    delayMs = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const client = await this.getClient();
        const result = await operation(client);
        return result;
      } catch (error) {
        lastError = error as Error;
        logError(`DatabaseManager.executeWithRetry.percobaan${attempt}`, error);

        // Jika error connection pool dan masih ada retry tersisa
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2024" &&
          attempt < maxRetries
        ) {
          logError(
            "DatabaseManager",
            `Mencoba lagi dalam ${delayMs}ms (percobaan ${attempt}/${maxRetries})`
          );

          await this.disconnect();
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        throw error;
      }
    }

    throw lastError || new Error("Maksimal retry terlewati");
  }
}

export const dbManager = DatabaseManager.getInstance();
export const getDb = () => dbManager.getClient();

export const db = new Proxy({} as PrismaClient, {
  get(target, prop) {
    return function (...args: any[]) {
      return dbManager.executeWithRetry(async (client) => {
        const method = (client as any)[prop];
        if (typeof method === "function") {
          return method.apply(client, args);
        }
        return method;
      });
    };
  },
});

export default db;
