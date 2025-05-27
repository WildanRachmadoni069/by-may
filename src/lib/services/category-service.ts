/**
 * Category Service
 *
 * Layanan untuk mengelola kategori produk pada aplikasi.
 * Menyediakan fungsi-fungsi CRUD untuk kategori.
 */

import { db } from "@/lib/db";
import {
  CategoryData,
  CategoryCreateInput,
  CategoryUpdateInput,
} from "@/types/category";

export const CategoryService = {
  /**
   * Mengambil semua kategori
   * @returns Promise yang menyelesaikan ke array kategori
   */
  async getCategories(): Promise<CategoryData[]> {
    return db.category.findMany({
      orderBy: { name: "asc" },
    }) as unknown as CategoryData[];
  },

  /**
   * Mengambil kategori berdasarkan ID
   * @param id ID kategori yang dicari
   * @returns Kategori yang ditemukan atau null
   */
  async getCategoryById(id: string): Promise<CategoryData | null> {
    const category = await db.category.findUnique({
      where: { id },
    });

    return category as unknown as CategoryData | null;
  },

  /**
   * Membuat kategori baru
   * @param data Data kategori yang akan dibuat
   * @returns Kategori yang dibuat
   */
  async createCategory(data: CategoryCreateInput): Promise<CategoryData> {
    return db.category.create({
      data: {
        name: data.name,
      },
    }) as unknown as CategoryData;
  },

  /**
   * Memperbarui kategori yang sudah ada
   * @param id ID kategori yang akan diperbarui
   * @param data Data kategori yang diperbarui
   * @returns Kategori yang diperbarui
   * @throws Error jika kategori tidak ditemukan
   */
  async updateCategory(
    id: string,
    data: CategoryUpdateInput
  ): Promise<CategoryData> {
    const existingCategory = await db.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new Error("Kategori tidak ditemukan");
    }

    return db.category.update({
      where: { id },
      data: {
        name: data.name,
      },
    }) as unknown as CategoryData;
  },

  /**
   * Menghapus kategori
   * @param id ID kategori yang akan dihapus
   * @throws Error jika kategori tidak ditemukan atau digunakan oleh produk
   */
  async deleteCategory(id: string): Promise<void> {
    const category = await db.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new Error("Kategori tidak ditemukan");
    }

    // Periksa apakah kategori digunakan oleh produk
    const productsCount = await db.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      throw new Error(
        `Kategori tidak dapat dihapus karena digunakan oleh ${productsCount} produk`
      );
    }

    await db.category.delete({
      where: { id },
    });
  },
};
