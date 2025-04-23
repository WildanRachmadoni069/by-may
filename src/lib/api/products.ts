/**
 * API Produk untuk Client Components
 *
 * File ini berisi fungsi untuk interaksi dengan API produk
 * dari client components.
 */

import {
  Product,
  ProductCreateInput,
  ProductUpdateInput,
  ProductsFilter,
  ProductsResponse,
} from "@/types/product";
import { PaginatedResult, PaginationInfo } from "@/types/common";

// Export tipe untuk penggunaan di modul lain
export type { Product, ProductCreateInput, ProductUpdateInput };
export type PaginationResult<T> = PaginatedResult<T>;

/**
 * Mengambil daftar produk dengan filter dan paginasi
 */
export async function getProducts(
  options: ProductsFilter = {}
): Promise<PaginatedResult<Product>> {
  const {
    category = "all",
    collection = "all",
    sortBy = "newest",
    searchQuery = "",
    page = 1,
    limit = 10,
  } = options;

  const params = new URLSearchParams();
  params.append("action", "list");
  if (category !== "all") params.append("category", category);
  if (collection !== "all" && collection !== "none") {
    params.append("collection", collection);
  } else if (collection === "none") {
    params.append("collection", "none");
  }
  params.append("sortBy", sortBy);
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (searchQuery) params.append("search", searchQuery);

  const res = await fetch(`/api/products?${params.toString()}`, {
    next: { tags: ["products"] },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Gagal mengambil produk: ${error}`);
  }

  return await res.json();
}

/**
 * Mengambil produk berdasarkan ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  return getProductBySlug(id);
}

/**
 * Mengambil produk berdasarkan slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const res = await fetch(`/api/products/${encodeURIComponent(slug)}`, {
    next: { tags: [`product-${slug}`] },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Gagal mengambil produk: ${await res.text()}`);
  }

  return await res.json();
}

/**
 * Membuat produk baru
 */
export async function createProduct(
  data: ProductCreateInput
): Promise<Product> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Gagal membuat produk: ${error}`);
  }

  return await res.json();
}

/**
 * Memperbarui produk yang sudah ada
 */
export async function updateProduct(
  slug: string,
  data: ProductUpdateInput
): Promise<Product> {
  const res = await fetch(`/api/products/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Gagal memperbarui produk: ${error}`);
  }

  return await res.json();
}

/**
 * Menghapus produk
 */
export async function deleteProduct(
  slug: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`/api/products/${encodeURIComponent(slug)}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Gagal menghapus produk");
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Mengambil produk terkait
 */
export async function getRelatedProducts(options: {
  productId: string;
  categoryId?: string;
  collectionId?: string;
  limit?: number;
}): Promise<Product[]> {
  const { productId, categoryId, collectionId, limit = 4 } = options;

  const params = new URLSearchParams();
  params.append("action", "related");
  params.append("productId", productId);
  if (categoryId) params.append("categoryId", categoryId);
  if (collectionId) params.append("collectionId", collectionId);
  params.append("limit", limit.toString());

  const res = await fetch(`/api/products?${params.toString()}`, {
    next: { tags: [`related-${productId}`] },
  });

  if (!res.ok) {
    console.error("Gagal mengambil produk terkait:", await res.text());
    return [];
  }

  return await res.json();
}

/**
 * Mengambil produk unggulan
 */
export async function getFeaturedProducts(
  limit: number = 8
): Promise<Product[]> {
  const params = new URLSearchParams();
  params.append("action", "featured");
  params.append("limit", limit.toString());

  const res = await fetch(`/api/products?${params.toString()}`, {
    next: { tags: ["featured-products"] },
  });

  if (!res.ok) {
    console.error("Gagal mengambil produk unggulan:", await res.text());
    return [];
  }

  return await res.json();
}

/**
 * Mengambil produk baru
 */
export async function getNewProducts(limit: number = 8): Promise<Product[]> {
  const params = new URLSearchParams();
  params.append("action", "new");
  params.append("limit", limit.toString());

  const res = await fetch(`/api/products?${params.toString()}`, {
    next: { tags: ["new-products"] },
  });

  if (!res.ok) {
    console.error("Gagal mengambil produk baru:", await res.text());
    return [];
  }

  return await res.json();
}
