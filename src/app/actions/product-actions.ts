"use server";

/**
 * Server Actions untuk Produk
 *
 * File ini berisi server actions untuk operasi produk.
 * Fungsi-fungsi ini digunakan untuk operasi server-side langsung dari
 * Server dan Client Components.
 */

import { revalidatePath } from "next/cache";
import { ProductService } from "@/lib/services/product-service";
import { CreateProductInput, Product } from "@/types/product";
import { PaginatedResult } from "@/types/common";
import { cookies } from "next/headers";

/**
 * Membuat produk baru
 * @param data Data produk yang akan dibuat
 * @returns Produk yang dibuat
 */
export async function createProductAction(
  data: CreateProductInput
): Promise<Product> {
  try {
    // Authentication for server actions
    // In production, uncomment this
    /*
    const cookieStore = cookies();
    const authToken = cookieStore.get("authToken")?.value;
    
    if (!authToken) {
      throw new Error("Authentication required");
    }
    
    const payload = verifyToken(authToken);
    if (!payload || payload.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    */

    // Clean up the data to ensure all nulls are properly handled
    const cleanedData = {
      ...data,
      description: data.description || null,
      featuredImage: data.featuredImage || null,
      additionalImages: data.additionalImages || [],
      basePrice: data.hasVariations ? null : data.basePrice || null,
      baseStock: data.hasVariations ? null : data.baseStock || null,
      specialLabel: data.specialLabel || null,
      weight: data.weight || null,
      dimensions: data.dimensions || null,
      meta: data.meta || null,
      categoryId: data.categoryId || null,
      collectionId: data.collectionId || null,
    };

    console.log(
      "Creating product with data:",
      JSON.stringify(
        {
          ...cleanedData,
          description: cleanedData.description ? "...content..." : null,
          priceVariants: cleanedData.priceVariants
            ? `${cleanedData.priceVariants.length} variants`
            : null,
        },
        null,
        2
      )
    );

    const product = await ProductService.createProduct(cleanedData);

    // Revalidate related paths
    revalidatePath("/products");
    revalidatePath("/dashboard/admin/product");

    return product;
  } catch (error) {
    console.error("Error in createProductAction:", error);
    throw error;
  }
}

/**
 * Memperbarui produk yang sudah ada
 * @param slug Slug produk yang akan diperbarui
 * @param data Data produk yang diperbarui
 * @returns Produk yang diperbarui
 */
export async function updateProductAction(
  slug: string,
  data: Partial<CreateProductInput>
): Promise<Product> {
  const updatedProduct = await ProductService.updateProduct(slug, data);

  // Revalidate related paths
  revalidatePath("/products");
  revalidatePath(`/products/${updatedProduct.slug}`);
  revalidatePath("/dashboard/admin/product");

  return updatedProduct;
}

/**
 * Menghapus produk dan gambar terkait
 * @param slug Slug produk yang akan dihapus
 */
export async function deleteProductAction(
  slug: string
): Promise<{ success: boolean; message?: string }> {
  const result = await ProductService.deleteProduct(slug);

  if (result.success) {
    // Revalidate related paths
    revalidatePath("/products");
    revalidatePath("/dashboard/admin/product");
  }

  return result;
}

/**
 * Mengambil produk berdasarkan slug
 * @param slug Slug produk yang dicari
 * @returns Produk atau null jika tidak ditemukan
 */
export async function getProductAction(slug: string): Promise<Product | null> {
  return await ProductService.getProductBySlug(slug);
}

/**
 * Mengambil daftar produk dengan paginasi dan filter
 * @param options Opsi filter dan paginasi
 * @returns Daftar produk terpaginasi
 */
export async function getProductsAction(
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
  return await ProductService.getProducts(options);
}
