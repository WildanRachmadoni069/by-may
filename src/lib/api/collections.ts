/**
 * Collection API Client
 *
 * Fungsi-fungsi untuk interaksi dengan Collection API dari client components
 */

import { ApiResponse } from "@/types/common";
import {
  CollectionData,
  CollectionCreateInput,
  CollectionUpdateInput,
  CollectionOption,
} from "@/types/collection";

/**
 * Mengambil semua koleksi
 * @returns Promise yang menyelesaikan ke array koleksi
 */
export async function getCollections(): Promise<CollectionData[]> {
  const res = await fetch("/api/collections", {
    next: { tags: ["collections"] },
  });

  if (!res.ok) {
    const error = (await res.json()) as ApiResponse;
    throw new Error(error.message || "Gagal mengambil koleksi");
  }

  const response = (await res.json()) as ApiResponse<CollectionData[]>;
  return response.data!;
}

/**
 * Mengambil semua koleksi dalam format untuk komponen select
 * @returns Array koleksi dengan format option
 */
export async function getCollectionOptions(): Promise<CollectionOption[]> {
  const collections = await getCollections();
  return collections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    slug: collection.slug,
    value: collection.slug,
    label: collection.name,
  }));
}

/**
 * Mengambil koleksi berdasarkan slug
 * @param slug Slug koleksi yang dicari
 * @returns Koleksi yang ditemukan
 */
export async function getCollectionBySlug(
  slug: string
): Promise<CollectionData> {
  const res = await fetch(`/api/collections/${slug}`, {
    next: { tags: [`collection-${slug}`] },
  });

  if (!res.ok) {
    const error = (await res.json()) as ApiResponse;
    throw new Error(error.message || "Gagal mengambil koleksi");
  }

  const response = (await res.json()) as ApiResponse<CollectionData>;
  return response.data!;
}

/**
 * Membuat koleksi baru
 * @param data Data koleksi yang akan dibuat
 * @returns Koleksi yang dibuat
 */
export async function createCollection(
  data: CollectionCreateInput
): Promise<CollectionData> {
  const res = await fetch("/api/collections", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = (await res.json()) as ApiResponse;
    throw new Error(error.message || "Gagal membuat koleksi");
  }

  const response = (await res.json()) as ApiResponse<CollectionData>;
  return response.data!;
}

/**
 * Memperbarui koleksi yang sudah ada
 * @param slug Slug koleksi yang akan diperbarui
 * @param data Data koleksi yang diperbarui
 * @returns Koleksi yang diperbarui
 */
export async function updateCollection(
  slug: string,
  data: CollectionUpdateInput
): Promise<CollectionData> {
  const res = await fetch(`/api/collections/${slug}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = (await res.json()) as ApiResponse;
    throw new Error(error.message || "Gagal memperbarui koleksi");
  }

  const response = (await res.json()) as ApiResponse<CollectionData>;
  return response.data!;
}

/**
 * Menghapus koleksi
 * @param slug Slug koleksi yang akan dihapus
 * @returns Object yang mengindikasikan keberhasilan operasi
 */
export async function deleteCollection(
  slug: string
): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`/api/collections/${slug}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const error = (await res.json()) as ApiResponse;
    throw new Error(error.message || "Gagal menghapus koleksi");
  }

  const response = (await res.json()) as ApiResponse;
  return {
    success: response.success,
    message: response.message,
  };
}
