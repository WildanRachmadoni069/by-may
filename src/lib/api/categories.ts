/**
 * Category API Client
 *
 * Fungsi-fungsi untuk interaksi dengan Category API dari client components
 */

import {
  CategoryData,
  CategoryCreateInput,
  CategoryUpdateInput,
} from "@/types/category";

/**
 * Mengambil semua kategori
 * @returns Promise yang menyelesaikan ke array kategori
 */
export async function getCategories(): Promise<CategoryData[]> {
  const res = await fetch("/api/categories", {
    next: { tags: ["categories"] },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Gagal mengambil kategori");
  }

  return res.json();
}

/**
 * Mengambil kategori berdasarkan ID
 * @param id ID kategori yang dicari
 * @returns Kategori yang ditemukan
 */
export async function getCategoryById(id: string): Promise<CategoryData> {
  const res = await fetch(`/api/categories/${id}`, {
    next: { tags: [`category-${id}`] },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Gagal mengambil kategori");
  }

  return res.json();
}

/**
 * Membuat kategori baru
 * @param data Data kategori yang akan dibuat
 * @returns Kategori yang dibuat
 */
export async function createCategory(
  data: CategoryCreateInput
): Promise<CategoryData> {
  const res = await fetch("/api/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Gagal membuat kategori");
  }

  return res.json();
}

/**
 * Memperbarui kategori yang sudah ada
 * @param id ID kategori yang akan diperbarui
 * @param data Data kategori yang diperbarui
 * @returns Kategori yang diperbarui
 */
export async function updateCategory(
  id: string,
  data: CategoryUpdateInput
): Promise<CategoryData> {
  const res = await fetch(`/api/categories/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Gagal memperbarui kategori");
  }

  return res.json();
}

/**
 * Menghapus kategori
 * @param id ID kategori yang akan dihapus
 * @returns Hasil operasi penghapusan
 */
export async function deleteCategory(
  id: string
): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`/api/categories/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Gagal menghapus kategori");
  }

  return res.json();
}
