/**
 * API Products untuk Client Components
 *
 * File ini berisi fungsi untuk interaksi dengan API produk
 * dari client components. Untuk operasi server, gunakan product-actions.ts.
 */

import { PaginatedResult } from "@/types/common";
import { Product, CreateProductInput } from "@/types/product";

// Get products with filtering and pagination
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
    throw new Error("Failed to fetch products");
  }

  return res.json();
}

// Get product by slug
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const res = await fetch(`/api/products/${slug}`, {
    next: { tags: [`product-${slug}`] },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Failed to fetch product");
  }

  return res.json();
}

// Create a new product
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
      errorData?.details || errorData?.error || "Failed to create product"
    );
  }

  return res.json();
}

// Update a product
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
      errorData?.details || errorData?.error || "Failed to update product"
    );
  }

  return res.json();
}

// Delete a product
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
        errorData?.details || errorData?.error || "Failed to delete product",
    };
  }

  return { success: true };
}
