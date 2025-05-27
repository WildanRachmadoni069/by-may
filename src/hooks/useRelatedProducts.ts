import useSWR from "swr";
import { Product } from "@/types/product";
import { getRelatedProducts } from "@/lib/api/products";

/**
 * Hook for fetching related products with smart prioritization
 * @param currentProductId - ID of the current product to exclude
 * @param categoryId - Optional category ID for related products
 * @param collectionId - Optional collection ID for related products
 * @param limit - Number of related products to fetch (default: 4)
 * @param swrOptions - Additional SWR options
 */
export function useRelatedProducts(
  currentProductId: string,
  categoryId?: string | null,
  collectionId?: string | null,
  limit: number = 4,
  swrOptions = {}
) {
  // Build the API URL with all parameters for backend prioritization
  const apiUrl = `/api/products/related?productId=${currentProductId}${
    categoryId ? `&categoryId=${categoryId}` : ""
  }${collectionId ? `&collectionId=${collectionId}` : ""}&limit=${limit}`;

  const { data, error, isLoading } = useSWR(
    currentProductId ? apiUrl : null,
    () => getRelatedProducts(currentProductId, categoryId, collectionId, limit),
    {
      dedupingInterval: 60000, // 1 minute
      revalidateOnFocus: false,
      ...swrOptions,
    }
  );

  return {
    relatedProducts: data || [],
    isLoading,
    error,
  };
}
