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
import { ApiResponse } from "@/types/common";
import { getErrorMessage } from "../debug";

/**
 * Mengambil semua kategori
 * @returns Promise yang menyelesaikan ke array kategori
 */
export async function getCategories(): Promise<ApiResponse<CategoryData[]>> {
  const res = await fetch("/api/categories", {
    next: { tags: ["categories"] },
  });

  return await res.json();
}

/**
 * Mengambil kategori berdasarkan ID
 * @param id ID kategori yang dicari
 * @returns Kategori yang ditemukan
 */
export async function getCategoryById(
  id: string
): Promise<ApiResponse<CategoryData>> {
  const res = await fetch(`/api/categories/${id}`, {
    next: { tags: [`category-${id}`] },
  });

  return await res.json();
}

/**
 * Membuat kategori baru
 * @param data Data kategori yang akan dibuat
 * @returns Response API yang berisi data kategori yang dibuat
 */
export async function createCategory(
  data: CategoryCreateInput
): Promise<ApiResponse<CategoryData>> {
  const res = await fetch("/api/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const response = await res.json();

  if (!response.success) {
    throw new Error(response.message || "Failed to create category");
  }

  return response;
}

/**
 * Memperbarui kategori yang sudah ada
 * @param id ID kategori yang akan diperbarui
 * @param data Data kategori yang diperbarui
 * @returns Response API yang berisi data kategori yang diperbarui
 */
export async function updateCategory(
  id: string,
  data: CategoryUpdateInput
): Promise<ApiResponse<CategoryData>> {
  const res = await fetch(`/api/categories/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const response = await res.json();

  if (!response.success) {
    throw new Error(response.message || "Failed to update category");
  }

  return response;
}

/**
 * Menghapus kategori
 * @param id ID kategori yang akan dihapus
 * @returns Response API untuk operasi penghapusan
 */
export async function deleteCategory(id: string): Promise<ApiResponse> {
  const res = await fetch(`/api/categories/${id}`, {
    method: "DELETE",
  });

  const response = await res.json();

  if (!response.success) {
    throw new Error(response.message || "Failed to delete category");
  }

  return response;
}
