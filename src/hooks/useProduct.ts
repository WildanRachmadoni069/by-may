import useSWR from "swr";
import { Product } from "@/types/product";
import { getProduct } from "@/lib/api/products";

/**
 * SWR hook for fetching a single product by slug
 * @param slug - Product slug
 * @param swrOptions - Additional SWR options
 * @returns SWR response with product data, loading state, and error
 */
export function useProduct(slug: string | null | undefined, swrOptions = {}) {
  // Only fetch if slug is provided
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    slug ? `/api/products/${slug}` : null,
    () => (slug ? getProduct(slug) : null),
    {
      dedupingInterval: 5000, // 5 seconds
      revalidateOnFocus: false,
      ...swrOptions,
    }
  );

  return {
    product: data,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
