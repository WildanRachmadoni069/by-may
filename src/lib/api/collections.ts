/**
 * Collection API Client
 *
 * Fungsi-fungsi untuk interaksi dengan Collection API dari client components
 */

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
    const error = await res.text();
    throw new Error(error || "Gagal mengambil koleksi");
  }

  return res.json();
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
    value: collection.id,
    label: collection.name,
  }));
}

/**
 * Mengambil koleksi berdasarkan ID
 * @param id ID koleksi yang dicari
 * @returns Koleksi yang ditemukan
 */
export async function getCollectionById(id: string): Promise<CollectionData> {
  const res = await fetch(`/api/collections/${id}`, {
    next: { tags: [`collection-${id}`] },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Gagal mengambil koleksi");
  }

  return res.json();
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
    const error = await res.text();
    throw new Error(error || "Gagal membuat koleksi");
  }

  return res.json();
}

/**
 * Memperbarui koleksi yang sudah ada
 * @param id ID koleksi yang akan diperbarui
 * @param data Data koleksi yang diperbarui
 * @returns Koleksi yang diperbarui
 */
export async function updateCollection(
  id: string,
  data: CollectionUpdateInput
): Promise<CollectionData> {
  const res = await fetch(`/api/collections/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Gagal memperbarui koleksi");
  }

  return res.json();
}

/**
 * Menghapus koleksi
 * @param id ID koleksi yang akan dihapus
 * @returns Hasil operasi penghapusan
 */
export async function deleteCollection(
  id: string
): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`/api/collections/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Gagal menghapus koleksi");
  }

  return res.json();
}
