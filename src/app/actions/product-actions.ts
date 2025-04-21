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
 * @param id ID produk yang dicari
 * @returns Produk atau null jika tidak ditemukan
 */
export async function getProductAction(id: string): Promise<Product | null> {
  return await ProductService.getProductById(id);
}

/**
 * Mengambil produk berdasarkan slug
 * @param slug Slug produk yang dicari
 * @returns Produk atau null jika tidak ditemukan
 */
export async function getProductBySlugAction(
  slug: string
): Promise<Product | null> {
  return await ProductService.getProductBySlug(slug);
}

/**
 * Mengambil produk terpaginasi dengan opsi filter
 * @param options Opsi filter dan paginasi
 * @returns Produk terpaginasi dan metadata
 */
export async function getProductsAction(
  options: ProductsFilter = {}
): Promise<PaginatedResult<Product>> {
  return await ProductService.getProducts(options);
}

/**
 * Membuat produk baru
 * @param data Data produk yang akan dibuat
 * @returns Produk yang dibuat
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
 * @param id ID produk yang akan diperbarui
 * @param data Data produk yang diperbarui
 * @returns Produk yang diperbarui
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
 * @param id ID produk yang akan dihapus
 * @returns Status keberhasilan operasi
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

/**
 * Mengambil produk terkait berdasarkan kategori/koleksi
 * @param options Opsi untuk mencari produk terkait
 * @returns List produk terkait
 */
export async function getRelatedProductsAction(options: {
  productId: string;
  categoryId?: string;
  collectionId?: string;
  limit?: number;
}): Promise<Product[]> {
  return await ProductService.getRelatedProducts(options);
}

/**
 * Mengambil produk berdasarkan label khusus (featured, new)
 * @param label Label produk yang dicari
 * @param limit Jumlah produk yang diambil
 * @returns List produk sesuai label
 */
export async function getProductsByLabelAction(
  label: string,
  limit: number = 8
): Promise<Product[]> {
  return await ProductService.getProductsByLabel(label, limit);
}
