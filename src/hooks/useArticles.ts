/**
 * SWR Hook untuk Artikel
 *
 * Hook ini digunakan untuk fetching data artikel dengan SWR.
 * Bekerja bersama dengan Zustand store untuk UI state management.
 */

import useSWR from "swr";
import { getArticles } from "@/lib/api/articles";
import { ArticleData } from "@/types/article";
import { PaginatedResult } from "@/types/common";

export type ArticlesFilters = {
  page?: number;
  limit?: number;
  searchQuery?: string;
  status?: "draft" | "published";
  sort?: "asc" | "desc";
};

/**
 * SWR hook for fetching articles with filters and pagination
 * @param filters - Filters and pagination options
 * @param swrOptions - Additional SWR options
 * @returns SWR response with articles data, loading state, and error
 */
export function useArticles(filters: ArticlesFilters = {}, swrOptions = {}) {
  // Generate cache key based on filters
  const queryParams = new URLSearchParams();

  if (filters.page) queryParams.append("page", filters.page.toString());
  if (filters.limit) queryParams.append("limit", filters.limit.toString());
  if (filters.status) queryParams.append("status", filters.status);
  if (filters.sort) queryParams.append("sort", filters.sort);
  if (filters.searchQuery) queryParams.append("search", filters.searchQuery);

  const queryString = queryParams.toString();
  const apiUrl = `/api/articles${queryString ? `?${queryString}` : ""}`;

  // Use SWR to fetch data
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    PaginatedResult<ArticleData>
  >(apiUrl, () => getArticles(filters), {
    dedupingInterval: 5000, // 5 seconds
    revalidateOnFocus: false,
    revalidateIfStale: true,
    ...swrOptions,
  });

  return {
    data: data?.data || [],
    pagination: data?.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
