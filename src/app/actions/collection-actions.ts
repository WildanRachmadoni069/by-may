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
 * @param id ID koleksi yang akan diperbarui
 * @param data Data koleksi yang diperbarui
 * @returns Koleksi yang diperbarui
 */
export async function updateCollectionAction(
  id: string,
  data: CollectionUpdateInput
): Promise<CollectionData> {
  // Verifikasi autentikasi admin
  await checkAdminAuth();

  const collection = await CollectionService.updateCollection(id, data);
  revalidatePath("/produk");
  revalidatePath("/dashboard/admin/product/collection");
  return collection;
}

/**
 * Menghapus koleksi
 * @param id ID koleksi yang akan dihapus
 */
export async function deleteCollectionAction(
  id: string
): Promise<{ success: boolean; message?: string }> {
  // Verifikasi autentikasi admin
  await checkAdminAuth();

  try {
    await CollectionService.deleteCollection(id);
    revalidatePath("/produk");
    revalidatePath("/dashboard/admin/product/collection");
    return { success: true };
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
 * Mengambil koleksi berdasarkan ID
 * @param id ID koleksi yang dicari
 * @returns Koleksi yang ditemukan atau null
 */
export async function getCollectionByIdAction(
  id: string
): Promise<CollectionData | null> {
  return await CollectionService.getCollectionById(id);
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
    value: collection.id,
    label: collection.name,
  }));
}
