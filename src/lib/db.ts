import { PrismaClient } from "@/generated/prisma/client";

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Create a safe version of PrismaClient that won't initialize in browser
let prismaInstance: PrismaClient | undefined;

if (!isBrowser) {
  // Server-side only code
  prismaInstance = globalThis.prisma || new PrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = prismaInstance;
  }
}

// Export a safe version that won't run in the browser
export const db = prismaInstance as PrismaClient;
export const prisma = prismaInstance as PrismaClient;
export default db;

// Add a type declaration to prevent TypeScript errors
declare global {
  var prisma: PrismaClient | undefined;
}
