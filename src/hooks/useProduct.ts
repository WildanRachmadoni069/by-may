import useSWR from "swr";
import { Product } from "@/types/product";

/**
 * Fetch function for a single product
 */
const productFetcher = async (url: string): Promise<Product> => {
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Product not found");
    }
    throw new Error(`Failed to fetch product: ${response.statusText}`);
  }

  return response.json();
};

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
    productFetcher,
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
