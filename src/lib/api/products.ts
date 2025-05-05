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
 * Mengambil daftar produk dengan filter opsional
 * @param options Opsi filter dan paginasi
 * @returns Hasil produk terpaginasi
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

  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (search) params.append("search", search);
  if (categoryId) params.append("categoryId", categoryId);
  if (collectionId) params.append("collectionId", collectionId);
  if (specialLabel) params.append("specialLabel", specialLabel);
  if (sortBy) params.append("sortBy", sortBy);

  // Tambahkan parameter untuk mengambil priceVariants
  params.append("includePriceVariants", "true");

  const res = await fetch(`/api/products?${params.toString()}`, {
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil produk");
  }

  return await res.json();
}

/**
 * Mengambil produk berdasarkan slug
 * @param slug Slug produk yang dicari
 * @returns Produk atau null jika tidak ditemukan
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const res = await fetch(`/api/products/${slug}`, {
    next: { tags: [`product-${slug}`] },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch product: ${res.statusText}`);
  }

  return await res.json();
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
