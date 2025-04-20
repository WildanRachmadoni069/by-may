/**
 * Collection Service
 *
 * Layanan untuk mengelola koleksi produk pada aplikasi.
 * Menyediakan fungsi-fungsi CRUD untuk koleksi.
 */

import { db } from "@/lib/db";
import {
  CollectionData,
  CollectionCreateInput,
  CollectionUpdateInput,
} from "@/types/collection";

export const CollectionService = {
  /**
   * Mengambil semua koleksi
   * @returns Promise yang menyelesaikan ke array koleksi
   */
  async getCollections(): Promise<CollectionData[]> {
    return db.collection.findMany({
      orderBy: { name: "asc" },
    }) as unknown as CollectionData[];
  },

  /**
   * Mengambil koleksi berdasarkan ID
   * @param id ID koleksi yang dicari
   * @returns Koleksi yang ditemukan atau null
   */
  async getCollectionById(id: string): Promise<CollectionData | null> {
    const collection = await db.collection.findUnique({
      where: { id },
    });

    return collection as unknown as CollectionData | null;
  },

  /**
   * Membuat koleksi baru
   * @param data Data koleksi yang akan dibuat
   * @returns Koleksi yang dibuat
   */
  async createCollection(data: CollectionCreateInput): Promise<CollectionData> {
    return db.collection.create({
      data: {
        name: data.name,
      },
    }) as unknown as CollectionData;
  },

  /**
   * Memperbarui koleksi yang sudah ada
   * @param id ID koleksi yang akan diperbarui
   * @param data Data koleksi yang diperbarui
   * @returns Koleksi yang diperbarui
   * @throws Error jika koleksi tidak ditemukan
   */
  async updateCollection(
    id: string,
    data: CollectionUpdateInput
  ): Promise<CollectionData> {
    const existingCollection = await db.collection.findUnique({
      where: { id },
    });

    if (!existingCollection) {
      throw new Error("Koleksi tidak ditemukan");
    }

    return db.collection.update({
      where: { id },
      data: {
        name: data.name,
      },
    }) as unknown as CollectionData;
  },

  /**
   * Menghapus koleksi
   * @param id ID koleksi yang akan dihapus
   * @throws Error jika koleksi tidak ditemukan atau digunakan oleh produk
   */
  async deleteCollection(id: string): Promise<void> {
    const collection = await db.collection.findUnique({
      where: { id },
    });

    if (!collection) {
      throw new Error("Koleksi tidak ditemukan");
    }

    // Periksa apakah koleksi digunakan oleh produk
    const productsCount = await db.product.count({
      where: { collectionId: id },
    });

    if (productsCount > 0) {
      throw new Error(
        `Koleksi tidak dapat dihapus karena digunakan oleh ${productsCount} produk`
      );
    }

    await db.collection.delete({
      where: { id },
    });
  },
};
