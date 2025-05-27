import useSWR from "swr";
import { SEOSetting } from "@/types/seo";
import { getSEOSetting, getSEOSettings } from "@/lib/api/seo";

/**
 * Hook untuk mendapatkan semua pengaturan SEO dengan SWR
 */
export function useSEOSettings() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/seo",
    getSEOSettings,
    {
      dedupingInterval: 5000, // 5 seconds
      revalidateOnFocus: false,
    }
  );

  return {
    seoSettings: data || [],
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook untuk mendapatkan pengaturan SEO untuk halaman tertentu dengan SWR
 * @param pageId ID halaman yang ingin diambil pengaturan SEO-nya
 */
export function useSEOSetting(pageId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    pageId ? `/api/seo/${pageId}` : null,
    pageId ? () => getSEOSetting(pageId) : null,
    {
      dedupingInterval: 5000, // 5 seconds
      revalidateOnFocus: false,
      // Don't retry if the SEO setting is not found (404)
      shouldRetryOnError: (err) => !err.message?.includes("not found"),
    }
  );

  // Return the data as null if it's null (not found) to make it explicit
  return {
    seoSetting: data ?? null,
    isLoading,
    error,
    mutate,
  };
}
