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

/**
 * Generates search keywords from a product name
 * Breaks down the name into individual words and meaningful n-grams
 * @param name - Product name to generate keywords from
 * @returns Array of search keywords
 */
export function generateSearchKeywords(name: string): string[] {
  if (!name) return [];

  // Convert to lowercase and remove special characters
  const normalizedName = name.toLowerCase().replace(/[^\w\s]/g, " ");

  // Split into words
  const words = normalizedName.split(/\s+/).filter((word) => word.length > 1);

  // Create a set to avoid duplicates
  const keywordsSet = new Set<string>();

  // Add each word
  words.forEach((word) => {
    keywordsSet.add(word);
  });

  // Add pairs of words (bigrams)
  for (let i = 0; i < words.length - 1; i++) {
    keywordsSet.add(`${words[i]} ${words[i + 1]}`);
  }

  // Add original normalized name
  keywordsSet.add(normalizedName);

  return Array.from(keywordsSet);
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param array - The array to shuffle
 * @returns A new shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Format a date to a locale-friendly string
 * @param dateStr Date string or Date object to format
 * @param locale Locale to use for formatting (default: 'id-ID')
 * @returns Formatted date string
 */
export function formatDate(
  dateStr: string | Date | undefined | null,
  locale: string = "id-ID"
): string {
  if (!dateStr) return "N/A";

  try {
    const date = new Date(dateStr);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    return date.toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Error";
  }
}

/**
 * Mengubah string menjadi format slug yang SEO-friendly
 * @param text - Teks yang akan diubah menjadi slug
 * @returns String dalam format slug (huruf kecil, tanpa spasi, hanya karakter alfanumerik dan tanda hubung)
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD") // Normalize to decomposed form for handling accents
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics/accents
    .toLowerCase() // Convert to lowercase
    .replace(/[^\w\s-]/g, "") // Remove all non-word chars (keep spaces and hyphens)
    .trim() // Trim whitespace from both ends
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Mengekstrak teks dari HTML dan membuat excerpt dengan panjang tertentu
 * @param html - String HTML yang akan diekstrak teksnya
 * @param maxLength - Panjang maksimum excerpt (default: 160 karakter)
 * @returns Plain text excerpt dengan panjang tertentu
 */
export function createExcerptFromHtml(
  html: string,
  maxLength: number = 160
): string {
  if (!html) return "";

  // Hapus semua tag HTML
  const plainText = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Potong teks sesuai panjang yang diinginkan
  if (plainText.length <= maxLength) {
    return plainText;
  }

  // Potong pada batas kata dan tambahkan ellipsis
  return plainText.substring(0, maxLength).replace(/\s+\S*$/, "") + "...";
}
