"use server";

/**
 * Server Actions untuk Produk
 *
 * File ini berisi server actions untuk operasi produk.
 * Fungsi-fungsi ini digunakan untuk operasi server-side langsung dari
 * Server dan Client Components.
 */

import { revalidatePath } from "next/cache";
import {
  Product,
  ProductCreateInput,
  ProductUpdateInput,
  ProductsFilter,
  ProductsResponse,
} from "@/types/product";
import { PaginatedResult } from "@/types/common";
import { ProductService } from "@/lib/services/product-service";

/**
 * Mengambil produk berdasarkan ID
 */
export async function getProductAction(id: string): Promise<Product | null> {
  return await ProductService.getProductById(id);
}

/**
 * Mengambil produk berdasarkan slug
 */
export async function getProductBySlugAction(
  slug: string
): Promise<Product | null> {
  return await ProductService.getProductBySlug(slug);
}

/**
 * Mengambil produk terpaginasi dengan opsi filter
 */
export async function getProductsAction(
  options: ProductsFilter = {}
): Promise<PaginatedResult<Product>> {
  return await ProductService.getProducts(options);
}

/**
 * Membuat produk baru
 */
export async function createProductAction(
  data: ProductCreateInput
): Promise<Product> {
  const product = await ProductService.createProduct(data);
  revalidatePath("/produk");
  revalidatePath(`/produk/${product.slug}`);
  revalidatePath("/dashboard/admin/product");
  return product;
}

/**
 * Memperbarui produk yang sudah ada
 */
export async function updateProductAction(
  id: string,
  data: ProductUpdateInput
): Promise<Product> {
  const product = await ProductService.updateProduct(id, data);
  revalidatePath("/produk");
  revalidatePath(`/produk/${product.slug}`);
  revalidatePath("/dashboard/admin/product");
  return product;
}

/**
 * Menghapus produk dan gambar terkait
 */
export async function deleteProductAction(id: string): Promise<boolean> {
  const product = await ProductService.getProductById(id);
  const success = await ProductService.deleteProduct(id);

  if (success && product) {
    revalidatePath("/produk");
    revalidatePath("/dashboard/admin/product");
  }

  return success;
}
