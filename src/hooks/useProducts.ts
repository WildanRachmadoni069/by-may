import useSWR from "swr";
import { PaginatedResult } from "@/types/common";
import { Product } from "@/types/product";

export type ProductsFilters = {
  page?: number;
  limit?: number;
  searchQuery?: string;
  categoryId?: string;
  collectionId?: string;
  specialLabel?: string;
  sortBy?: string;
  includePriceVariants?: boolean;
};

/**
 * Fetch function for products
 * Converts searchQuery to search parameter for API
 */
const productsFetcher = async (
  url: string
): Promise<PaginatedResult<Product>> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  return response.json();
};

/**
 * SWR hook for fetching products with filters and pagination
 * @param filters - Filters and pagination options
 * @param swrOptions - Additional SWR options
 * @returns SWR response with products data, loading state, and error
 */
export function useProducts(filters: ProductsFilters = {}, swrOptions = {}) {
  // Prepare query parameters
  const queryParams = new URLSearchParams();

  if (filters.page) queryParams.append("page", filters.page.toString());
  if (filters.limit) queryParams.append("limit", filters.limit.toString());
  if (filters.categoryId) queryParams.append("categoryId", filters.categoryId);
  if (filters.collectionId)
    queryParams.append("collectionId", filters.collectionId);
  if (filters.specialLabel)
    queryParams.append("specialLabel", filters.specialLabel);
  if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
  if (filters.searchQuery) queryParams.append("search", filters.searchQuery);

  // Always include price variants for consistent data
  queryParams.append(
    "includePriceVariants",
    filters.includePriceVariants !== false ? "true" : "false"
  );

  // Generate cache key based on filters
  const queryString = queryParams.toString();
  const apiUrl = `/api/products${queryString ? `?${queryString}` : ""}`;

  // Use SWR to fetch data
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    apiUrl,
    productsFetcher,
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
