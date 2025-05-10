/**
 * SWR Hook untuk Single Article
 *
 * Hook ini digunakan untuk fetching data single artikel dengan SWR.
 * Bekerja bersama dengan Zustand store untuk UI state management.
 */

import useSWR from "swr";
import { ArticleData } from "@/types/article";
import { getArticleBySlug } from "@/lib/api/articles";

/**
 * SWR hook for fetching a single article by slug
 * @param slug - Article slug
 * @param swrOptions - Additional SWR options
 * @returns SWR response with article data, loading state, and error
 */
export function useArticle(slug: string | null | undefined, swrOptions = {}) {
  // Only fetch if slug is provided
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    slug ? `/api/articles/${slug}` : null,
    () => (slug ? getArticleBySlug(slug) : null),
    {
      dedupingInterval: 5000, // 5 seconds
      revalidateOnFocus: false,
      revalidateIfStale: true,
      ...swrOptions,
    }
  );

  return {
    article: data,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
