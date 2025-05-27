/**
 * Collection Service
 *
 * Layanan untuk mengelola koleksi produk pada aplikasi.
 * Menyediakan fungsi-fungsi CRUD untuk koleksi.
 */

import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import {
  CollectionData,
  CollectionCreateInput,
  CollectionUpdateInput,
  CollectionDeleteResponse,
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
   * Mengambil koleksi berdasarkan slug
   * @param slug Slug koleksi yang dicari
   * @returns Koleksi yang ditemukan atau null
   */
  async getCollectionBySlug(slug: string): Promise<CollectionData | null> {
    const collection = await db.collection.findUnique({
      where: { slug },
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
        slug: slugify(data.name),
      },
    }) as unknown as CollectionData;
  },

  /**
   * Memperbarui koleksi
   * @param slug Slug koleksi yang akan diperbarui
   * @param data Data koleksi yang diperbarui
   * @returns Koleksi yang diperbarui
   */
  async updateCollection(
    slug: string,
    data: CollectionUpdateInput
  ): Promise<CollectionData> {
    return db.collection.update({
      where: { slug },
      data: {
        name: data.name,
        slug: slugify(data.name),
      },
    }) as unknown as CollectionData;
  },
  /**
   * Menghapus koleksi
   * @param slug Slug koleksi yang akan dihapus
   * @returns Object yang mengindikasikan keberhasilan operasi
   * @throws Error jika koleksi masih digunakan oleh produk
   */ async deleteCollection(slug: string): Promise<CollectionDeleteResponse> {
    // Check if collection has products
    const collection = await db.collection.findUnique({
      where: { slug },
      include: {
        products: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!collection) {
      return {
        success: false,
        message: "Koleksi tidak ditemukan",
      };
    }

    if (collection.products.length > 0) {
      return {
        success: false,
        message: "Koleksi masih digunakan oleh produk dan tidak dapat dihapus",
      };
    }
    await db.collection.delete({
      where: { slug },
    });
    return {
      success: true,
      message: "Koleksi berhasil dihapus",
    };
  },
};
