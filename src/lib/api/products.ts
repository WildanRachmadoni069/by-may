/**
 * API Produk untuk Komponen Klien
 *
 * File ini berisi fungsi untuk berinteraksi dengan API produk
 * dari komponen klien. Untuk operasi server, gunakan product-actions.ts.
 */

import { PaginatedResult } from "@/types/common";
import { Product, CreateProductInput } from "@/types/product";

/**
 * Mengambil produk dengan filter dan paginasi
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
    sortBy,
  } = options;

  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  if (search) params.append("search", search);
  if (categoryId) params.append("categoryId", categoryId);
  if (collectionId) params.append("collectionId", collectionId);
  if (specialLabel) params.append("specialLabel", specialLabel);
  if (sortBy) params.append("sortBy", sortBy);

  const res = await fetch(`/api/products?${params.toString()}`, {
    next: { tags: ["products"] },
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil produk");
  }

  return res.json();
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
    throw new Error("Gagal mengambil produk");
  }

  return res.json();
}

/**
 * Membuat produk baru
 * @param data Data produk yang akan dibuat
 * @returns Produk yang dibuat
 */
export async function createProduct(
  data: CreateProductInput
): Promise<Product> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData?.details || errorData?.error || "Gagal membuat produk"
    );
  }

  return res.json();
}

/**
 * Memperbarui produk yang sudah ada
 * @param slug Slug produk yang akan diperbarui
 * @param data Data produk yang diperbarui
 * @returns Produk yang diperbarui
 */
export async function updateProduct(
  slug: string,
  data: Partial<CreateProductInput>
): Promise<Product> {
  const res = await fetch(`/api/products/${slug}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData?.details || errorData?.error || "Gagal memperbarui produk"
    );
  }

  return res.json();
}

/**
 * Menghapus produk
 * @param slug Slug produk yang akan dihapus
 * @returns Status keberhasilan dan pesan opsional
 */
export async function deleteProduct(
  slug: string
): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`/api/products/${slug}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    return {
      success: false,
      message:
        errorData?.details || errorData?.error || "Gagal menghapus produk",
    };
  }

  return { success: true };
}
