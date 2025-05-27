/**
 * Server-side SEO data fetching utilities
 */

import { db } from "@/lib/db";
import { logError } from "@/lib/debug";
import type { SEOSetting } from "@/types/seo";

/**
 * Get SEO setting for a specific page from PostgreSQL database
 * Used for server components like page layouts to get SEO metadata
 * @param pageId The page ID to get SEO settings for
 * @returns The SEO settings or null if not found
 */
export async function getSeoData(pageId: string): Promise<SEOSetting | null> {
  try {
    const seoSetting = await db.sEOSetting.findUnique({
      where: { pageId },
    });

    return seoSetting;
  } catch (error) {
    logError(`seo/fetch/${pageId}`, error);
    return null;
  }
}

/**
 * Get all SEO settings
 * @returns Array of SEO settings
 */
export async function getAllSeoData(): Promise<SEOSetting[]> {
  try {
    const seoSettings = await db.sEOSetting.findMany({
      orderBy: { pageId: "asc" },
    });

    return seoSettings;
  } catch (error) {
    logError("seo/fetch-all", error);
    return [];
  }
}
