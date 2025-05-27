import useSWR from "swr";
import { PaginatedResult } from "@/types/common";
import { Product } from "@/types/product";
import { getProducts } from "@/lib/api/products";

export type ProductsFilters = {
  page?: number;
  limit?: number;
  searchQuery?: string;
  categorySlug?: string;
  collectionId?: string;
  specialLabel?: string;
  sortBy?: string;
  includePriceVariants?: boolean;
};

/**
 * SWR hook for fetching products with filters and pagination
 * @param filters - Filters and pagination options
 * @param swrOptions - Additional SWR options
 * @returns SWR response with products data, loading state, and error
 */
export function useProducts(filters: ProductsFilters = {}, swrOptions = {}) {
  // Generate cache key based on filters
  const queryParams = new URLSearchParams();

  if (filters.page) queryParams.append("page", filters.page.toString());
  if (filters.limit) queryParams.append("limit", filters.limit.toString());
  if (filters.categorySlug)
    queryParams.append("categorySlug", filters.categorySlug);
  if (filters.collectionId)
    queryParams.append("collectionId", filters.collectionId);
  if (filters.specialLabel)
    queryParams.append("specialLabel", filters.specialLabel);
  if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
  if (filters.searchQuery) queryParams.append("search", filters.searchQuery);
  queryParams.append(
    "includePriceVariants",
    filters.includePriceVariants !== false ? "true" : "false"
  );

  const queryString = queryParams.toString();
  const apiUrl = `/api/products${queryString ? `?${queryString}` : ""}`;

  // Use SWR to fetch data
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    apiUrl,
    () => getProducts(filters),
    {
      dedupingInterval: 5000, // 5 seconds
      revalidateOnFocus: false,
      ...swrOptions,
    }
  );

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
