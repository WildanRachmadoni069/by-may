import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate a meaningful ID from a name or text
 * @param name - The name to generate ID from
 * @param prefix - Optional prefix for the ID
 * @returns A slugified ID with a random suffix
 */
export function generateMeaningfulId(name: string, prefix = ""): string {
  const base = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();

  const randomSuffix = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return prefix
    ? `${prefix}-${base}-${randomSuffix}`
    : `${base}-${randomSuffix}`;
}

/**
 * Check if a string appears to be a timestamp-based ID
 * @param id - The ID string to check
 * @returns True if the ID looks like a timestamp
 */
export function isLegacyTimestampId(id: string): boolean {
  return /^\d{13,}$/.test(id);
}

/**
 * Clean an object by removing undefined values
 * Useful for preparing data for Firestore which doesn't accept undefined
 */
export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  if (!obj || typeof obj !== "object") return obj;

  const result: Partial<T> = {};

  Object.entries(obj).forEach(([key, value]) => {
    // Skip undefined values
    if (value === undefined) return;

    // Clean nested objects recursively
    if (value !== null && typeof value === "object") {
      if (Array.isArray(value)) {
        result[key as keyof T] = value.map((item) =>
          typeof item === "object" && item !== null ? cleanObject(item) : item
        ) as any;
      } else {
        result[key as keyof T] = cleanObject(value) as any;
      }
    } else {
      result[key as keyof T] = value;
    }
  });

  return result;
}
