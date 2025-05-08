import useSWR from "swr";
import { Product } from "@/types/product";

/**
 * Fetch function for related products
 */
const relatedProductsFetcher = async (url: string): Promise<Product[]> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch related products: ${response.statusText}`);
  }

  return response.json();
};

/**
 * SWR hook for fetching related products
 * @param productId - ID of the current product to exclude
 * @param categoryId - Optional category ID for related products
 * @param collectionId - Optional collection ID for related products (higher priority than category)
 * @param limit - Number of related products to fetch
 * @param swrOptions - Additional SWR options
 * @returns SWR response with related products data, loading state, and error
 */
export function useRelatedProducts(
  productId: string | null | undefined,
  categoryId?: string | null,
  collectionId?: string | null,
  limit: number = 4,
  swrOptions = {}
) {
  // Only fetch if product ID is provided
  if (!productId) {
    return { relatedProducts: [], isLoading: false, error: null };
  }

  // Build query parameters
  const params = new URLSearchParams();
  params.append("exclude", productId);
  params.append("limit", (limit * 2).toString()); // Get more than needed for better selection

  // Add collection ID if available (higher priority)
  if (collectionId && collectionId !== "all" && collectionId !== "none") {
    params.append("collectionId", collectionId);
  }

  // Add category ID if available (used if collection doesn't return enough products)
  if (categoryId && categoryId !== "all" && categoryId !== "none") {
    params.append("categoryId", categoryId);
  }

  // The API endpoint will handle the prioritization logic
  const apiUrl = `/api/products/related?${params.toString()}`;

  const { data, error, isLoading } = useSWR(apiUrl, relatedProductsFetcher, {
    dedupingInterval: 10000, // 10 seconds
    revalidateOnFocus: false,
    ...swrOptions,
  });

  return {
    relatedProducts: data && data.length > 0 ? data.slice(0, limit) : [],
    isLoading,
    error,
  };
}
