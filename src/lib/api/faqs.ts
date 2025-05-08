/**
 * FAQ API Client
 *
 * Fungsi-fungsi untuk interaksi dengan FAQ API dari client components
 */

import { FAQ, FAQFormData, FAQFilters, FAQsResponse } from "@/types/faq";

/**
 * Mengambil semua FAQ dengan opsi paginasi dan filter
 * @param filters Opsi filter untuk FAQ
 * @returns Promise yang menyelesaikan ke response berisi array FAQ dan info paginasi
 */
export async function getFAQs(filters?: FAQFilters): Promise<FAQsResponse> {
  const searchParams = new URLSearchParams();

  if (filters?.page) searchParams.append("page", filters.page.toString());
  if (filters?.limit) searchParams.append("limit", filters.limit.toString());
  if (filters?.searchQuery) searchParams.append("search", filters.searchQuery);

  const queryString = searchParams.toString();
  const url = `/api/faqs${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(url, {
    next: { tags: ["faqs"] },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Gagal mengambil FAQ");
  }

  return res.json();
}

/**
 * Mengambil FAQ berdasarkan ID
 * @param id ID FAQ yang dicari
 * @returns FAQ yang ditemukan
 */
export async function getFAQById(id: string): Promise<FAQ> {
  const res = await fetch(`/api/faqs/${id}`, {
    next: { tags: [`faq-${id}`] },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Gagal mengambil FAQ");
  }

  return res.json();
}

/**
 * Membuat FAQ baru
 * @param data Data FAQ yang akan dibuat
 * @returns FAQ yang dibuat
 */
export async function createFAQ(data: FAQFormData): Promise<FAQ> {
  const res = await fetch("/api/faqs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Gagal membuat FAQ");
  }

  return res.json();
}

/**
 * Memperbarui FAQ yang sudah ada
 * @param id ID FAQ yang akan diperbarui
 * @param data Data FAQ yang diperbarui
 * @returns FAQ yang diperbarui
 */
export async function updateFAQ(
  id: string,
  data: Partial<FAQFormData>
): Promise<FAQ> {
  const res = await fetch(`/api/faqs/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Gagal memperbarui FAQ");
  }

  return res.json();
}

/**
 * Menghapus FAQ
 * @param id ID FAQ yang akan dihapus
 */
export async function deleteFAQ(id: string): Promise<void> {
  const res = await fetch(`/api/faqs/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Gagal menghapus FAQ");
  }
}

/**
 * Mengubah urutan FAQ
 * @param reorderedFAQs Array berisi id dan order baru untuk FAQ yang diubah
 */
export async function reorderFAQs(
  reorderedFAQs: { id: string; order: number }[]
): Promise<void> {
  const res = await fetch(`/api/faqs/reorder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reorderedFAQs }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Gagal mengubah urutan FAQ");
  }
}
