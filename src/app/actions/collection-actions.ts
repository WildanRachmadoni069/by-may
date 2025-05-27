"use server";

/**
 * Server Actions untuk Collection
 *
 * File ini berisi server actions untuk operasi koleksi produk.
 * Fungsi-fungsi ini digunakan untuk operasi server-side langsung dari
 * Server dan Client Components.
 */

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { CollectionService } from "@/lib/services/collection-service";
import {
  CollectionData,
  CollectionCreateInput,
  CollectionUpdateInput,
  CollectionOption,
} from "@/types/collection";
import { verifyToken } from "@/lib/auth/auth";

/**
 * Helper untuk memverifikasi admin auth
 * @returns Payload dari token jika autentikasi berhasil
 * @throws Error jika tidak terautentikasi
 */
async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const payload = verifyToken(token);

  if (!payload || !payload.id || payload.role !== "admin") {
    throw new Error("Unauthorized");
  }

  return payload;
}

/**
 * Membuat koleksi baru
 * @param data Data koleksi yang akan dibuat
 * @returns Koleksi yang dibuat
 */
export async function createCollectionAction(
  data: CollectionCreateInput
): Promise<CollectionData> {
  // Verifikasi autentikasi admin
  await checkAdminAuth();

  const collection = await CollectionService.createCollection(data);
  revalidatePath("/produk");
  revalidatePath("/dashboard/admin/product/collection");
  return collection;
}

/**
 * Memperbarui koleksi yang sudah ada
 * @param slug Slug koleksi yang akan diperbarui
 * @param data Data koleksi yang diperbarui
 * @returns Koleksi yang diperbarui
 */
export async function updateCollectionAction(
  slug: string,
  data: CollectionUpdateInput
): Promise<CollectionData> {
  // Verifikasi autentikasi admin
  await checkAdminAuth();

  const collection = await CollectionService.updateCollection(slug, data);
  revalidatePath("/produk");
  revalidatePath("/dashboard/admin/product/collection");
  return collection;
}

/**
 * Menghapus koleksi
 * @param slug Slug koleksi yang akan dihapus
 */
export async function deleteCollectionAction(
  slug: string
): Promise<{ success: boolean; message?: string }> {
  // Verifikasi autentikasi admin
  await checkAdminAuth();

  try {
    const result = await CollectionService.deleteCollection(slug);
    revalidatePath("/produk");
    revalidatePath("/dashboard/admin/product/collection");
    return result;
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal menghapus koleksi",
    };
  }
}

/**
 * Mengambil semua koleksi
 * @returns Array koleksi
 */
export async function getCollectionsAction(): Promise<CollectionData[]> {
  return await CollectionService.getCollections();
}

/**
 * Mengambil koleksi berdasarkan slug
 * @param slug Slug koleksi yang dicari
 * @returns Koleksi yang ditemukan atau null
 */
export async function getCollectionBySlugAction(
  slug: string
): Promise<CollectionData | null> {
  return await CollectionService.getCollectionBySlug(slug);
}

/**
 * Mengambil semua koleksi dalam format untuk komponen select
 * @returns Array koleksi dengan format option
 */
export async function getCollectionOptionsAction(): Promise<
  CollectionOption[]
> {
  const collections = await CollectionService.getCollections();
  return collections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    slug: collection.slug,
    value: collection.slug, // Changed from id to slug for URL-friendly values
    label: collection.name,
  }));
}
