/**
 * Products API client
 *
 * This file provides API client functions for product operations.
 * Used internally by SWR hooks for data fetching.
 */

import { PaginatedResult } from "@/types/common";
import {
  Product,
  CreateProductInput,
  UpdateProductInput,
} from "@/types/product";

/**
 * Fetch a single product by slug
 */
export async function getProduct(slug: string): Promise<Product> {
  const response = await fetch(`/api/products/${slug}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Product not found");
    }
    throw new Error(`Failed to fetch product: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch products with filters and pagination
 */
export async function getProducts(
  options: {
    page?: number;
    limit?: number;
    searchQuery?: string;
    categoryId?: string;
    collectionId?: string;
    specialLabel?: string;
    sortBy?: string;
    includePriceVariants?: boolean;
  } = {}
): Promise<PaginatedResult<Product>> {
  // Prepare query parameters
  const queryParams = new URLSearchParams();

  if (options.page) queryParams.append("page", options.page.toString());
  if (options.limit) queryParams.append("limit", options.limit.toString());
  if (options.searchQuery) queryParams.append("search", options.searchQuery);
  if (options.categoryId) queryParams.append("categoryId", options.categoryId);
  if (options.collectionId)
    queryParams.append("collectionId", options.collectionId);
  if (options.specialLabel)
    queryParams.append("specialLabel", options.specialLabel);
  if (options.sortBy) queryParams.append("sortBy", options.sortBy);
  if (options.includePriceVariants)
    queryParams.append("includePriceVariants", "true");

  const response = await fetch(`/api/products?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch related products
 */
export async function getRelatedProducts(
  productId: string,
  categoryId?: string | null,
  collectionId?: string | null,
  limit: number = 4
): Promise<Product[]> {
  const queryParams = new URLSearchParams();
  queryParams.append("productId", productId);
  if (categoryId) queryParams.append("categoryId", categoryId);
  if (collectionId) queryParams.append("collectionId", collectionId);
  queryParams.append("limit", limit.toString());

  const response = await fetch(
    `/api/products/related?${queryParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch related products: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || [];
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
