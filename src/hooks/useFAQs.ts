import useSWR from "swr";
import { FAQFilters, FAQsResponse } from "@/types/faq";

/**
 * Hook untuk mendapatkan data FAQ dengan SWR
 * @param filters Opsi filter dan paginasi
 */
export function useFAQs(filters?: FAQFilters) {
  const { page = 1, limit = 10, searchQuery } = filters || {};

  // Bangun key SWR berdasarkan parameter filter
  let key = `/api/faqs?page=${page}&limit=${limit}`;
  if (searchQuery) key += `&search=${encodeURIComponent(searchQuery)}`;

  const { data, error, isLoading, mutate, isValidating } = useSWR<FAQsResponse>(
    key,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to fetch FAQs");
      }
      return res.json();
    }
  );

  return {
    faqs: data?.faqs || [],
    pagination: data?.pagination || { page, limit, total: 0, totalPages: 0 },
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

/**
 * Hook untuk mendapatkan data satu FAQ dengan SWR
 * @param id ID FAQ yang ingin diambil
 */
export function useFAQ(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/faqs/${id}` : null,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to fetch FAQ");
      }
      return res.json();
    }
  );

  return {
    faq: data,
    isLoading,
    error,
    mutate,
  };
}
