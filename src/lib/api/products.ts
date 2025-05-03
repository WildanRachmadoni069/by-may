/**
 * API Products
 *
 * File ini berisi fungsi-fungsi untuk berinteraksi dengan API produk
 */

import {
  Product,
  CreateProductInput,
  UpdateProductInput,
} from "@/types/product";
import { PaginatedResult } from "@/types/common";

/**
 * Mengambil daftar produk dengan filter
 * @param options Opsi filter dan paginasi
 * @returns Daftar produk terpaginasi
 */
export async function getProducts(
  options: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    collectionId?: string;
    specialLabel?: string;
    sortBy?: string;
  } = {}
): Promise<PaginatedResult<Product>> {
  const {
    page = 1,
    limit = 10,
    search,
    categoryId,
    collectionId,
    specialLabel,
    sortBy = "newest",
  } = options;

  // Build query string
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (search) params.append("search", search);
  if (categoryId) params.append("categoryId", categoryId);
  if (collectionId) params.append("collectionId", collectionId);
  if (specialLabel) params.append("specialLabel", specialLabel);
  if (sortBy) params.append("sortBy", sortBy);

  const response = await fetch(`/api/products?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Mengambil produk berdasarkan slug
 * @param slug Slug produk yang akan diambil
 * @returns Data produk atau null jika tidak ditemukan
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const response = await fetch(`/api/products/${slug}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching product with slug ${slug}:`, error);
    throw error;
  }
}

/**
 * Membuat produk baru
 * @param data Data produk yang akan dibuat
 * @returns Produk yang dibuat
 */
export async function createProduct(
  data: CreateProductInput
): Promise<Product> {
  const response = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Failed to create product: ${response.status}`
    );
  }

  return await response.json();
}

/**
 * Memperbarui produk
 * @param slug Slug produk yang akan diperbarui
 * @param data Data produk yang diperbarui
 * @returns Produk yang diperbarui
 */
export async function updateProduct(
  slug: string,
  data: UpdateProductInput
): Promise<Product> {
  const response = await fetch(`/api/products/${slug}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Failed to update product: ${response.status}`
    );
  }

  return await response.json();
}

/**
 * Menghapus produk
 * @param slug Slug produk yang akan dihapus
 * @returns Status keberhasilan dan pesan
 */
export async function deleteProduct(
  slug: string
): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(`/api/products/${slug}`, {
    method: "DELETE",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      success: false,
      message: data.error || `Failed to delete product: ${response.status}`,
    };
  }

  return {
    success: true,
    ...data,
  };
}
