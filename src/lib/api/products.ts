/**
 * API Produk untuk Client Components
 *
 * File ini berisi fungsi untuk interaksi dengan API produk
 * dari client components. Untuk operasi server, gunakan product-actions.ts.
 */

import {
  Product,
  ProductCreateInput,
  ProductUpdateInput,
  ProductsFilter,
  ProductsResponse,
} from "@/types/product";
import { PaginatedResult, PaginationInfo } from "@/types/common";

// Export types for usage in other modules
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
    throw new Error(`Failed to fetch products: ${error}`);
  }

  return await res.json();
}

/**
 * Mengambil produk berdasarkan ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  // Use the consolidated API - ID is treated as the slug
  return getProductBySlug(id);
}

/**
 * Mengambil produk berdasarkan slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  // Use the new consolidated API endpoint
  const res = await fetch(`/api/products/${encodeURIComponent(slug)}`, {
    next: { tags: [`product-${slug}`] },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to retrieve product: ${await res.text()}`);
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
    throw new Error(`Failed to create product: ${error}`);
  }

  return await res.json();
}

/**
 * Memperbarui produk yang sudah ada
 */
export async function updateProduct(
  id: string,
  data: ProductUpdateInput
): Promise<Product> {
  // Use the consolidated API endpoint - ID is treated as the slug
  const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to update product: ${error}`);
  }

  return await res.json();
}

/**
 * Menghapus produk
 */
export async function deleteProduct(id: string): Promise<boolean> {
  // Use the consolidated API endpoint - ID is treated as the slug
  const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to delete product: ${error}`);
  }

  return await res.json();
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
    console.error("Error fetching related products:", await res.text());
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
    console.error("Error fetching featured products:", await res.text());
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
    console.error("Error fetching new products:", await res.text());
    return [];
  }

  return await res.json();
}
