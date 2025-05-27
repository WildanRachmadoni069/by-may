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
import { ApiResponse } from "@/types/common";
import { slugify } from "@/lib/utils";

export const CategoryService = {
  /**
   * Mengambil semua kategori
   * @returns Promise yang menyelesaikan ke ApiResponse berisi array kategori
   */
  async getCategories(): Promise<ApiResponse<CategoryData[]>> {
    try {
      const categories = await db.category.findMany({
        orderBy: { name: "asc" },
      });

      return {
        success: true,
        data: categories as CategoryData[],
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Gagal mengambil kategori",
      };
    }
  },

  /**
   * Mengambil kategori berdasarkan ID
   * @param id ID kategori yang dicari
   * @returns Kategori yang ditemukan dalam ApiResponse
   */
  async getCategoryById(id: string): Promise<ApiResponse<CategoryData>> {
    try {
      const category = await db.category.findUnique({
        where: { id },
      });

      if (!category) {
        return {
          success: false,
          message: "Kategori tidak ditemukan",
        };
      }

      return {
        success: true,
        data: category as CategoryData,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Gagal mengambil kategori",
      };
    }
  },

  /**
   * Mengambil kategori berdasarkan slug
   * @param slug Slug kategori yang dicari
   * @returns Promise yang menyelesaikan ke ApiResponse berisi kategori
   */
  async getCategoryBySlug(slug: string): Promise<ApiResponse<CategoryData>> {
    try {
      const category = await db.category.findUnique({
        where: { slug },
      });

      if (!category) {
        return {
          success: false,
          message: "Kategori tidak ditemukan",
        };
      }

      return {
        success: true,
        data: category as CategoryData,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Gagal mengambil kategori",
      };
    }
  },

  /**
   * Membuat kategori baru
   * @param data Data kategori yang akan dibuat
   * @returns Promise yang menyelesaikan ke ApiResponse berisi kategori yang dibuat
   */
  async createCategory(
    data: CategoryCreateInput
  ): Promise<ApiResponse<CategoryData>> {
    try {
      const slug = slugify(data.name);

      // Cek duplikasi slug
      const existingWithSlug = await db.category.findUnique({
        where: { slug },
      });

      if (existingWithSlug) {
        return {
          success: false,
          message: "Nama kategori harus unik",
        };
      }

      const category = await db.category.create({
        data: {
          name: data.name,
          slug,
        },
      });

      return {
        success: true,
        data: category as CategoryData,
        message: "Kategori berhasil dibuat",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Gagal membuat kategori",
      };
    }
  },

  /**
   * Memperbarui kategori yang sudah ada
   * @param id ID kategori yang akan diperbarui
   * @param data Data kategori yang diperbarui
   * @returns Promise yang menyelesaikan ke ApiResponse berisi kategori yang diperbarui
   */
  async updateCategory(
    id: string,
    data: CategoryUpdateInput
  ): Promise<ApiResponse<CategoryData>> {
    try {
      const existingCategory = await db.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        return {
          success: false,
          message: "Kategori tidak ditemukan",
        };
      }

      if (data.name) {
        const slug = slugify(data.name);

        // Cek duplikasi slug, kecuali dengan diri sendiri
        const existingWithSlug = await db.category.findFirst({
          where: {
            slug,
            id: { not: id },
          },
        });

        if (existingWithSlug) {
          return {
            success: false,
            message: "Nama kategori harus unik",
          };
        }

        const updatedCategory = await db.category.update({
          where: { id },
          data: {
            name: data.name,
            slug,
          },
        });

        return {
          success: true,
          data: updatedCategory as CategoryData,
          message: "Kategori berhasil diperbarui",
        };
      }

      return {
        success: true,
        data: existingCategory as CategoryData,
        message: "Tidak ada perubahan yang diperlukan",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Gagal memperbarui kategori",
      };
    }
  },

  /**
   * Menghapus kategori
   * @param id ID kategori yang akan dihapus
   * @returns Promise yang menyelesaikan ke ApiResponse
   */
  async deleteCategory(id: string): Promise<ApiResponse> {
    try {
      const category = await db.category.findUnique({
        where: { id },
      });

      if (!category) {
        return {
          success: false,
          message: "Kategori tidak ditemukan",
        };
      }

      // Periksa apakah kategori digunakan oleh produk
      const productsCount = await db.product.count({
        where: { categoryId: id },
      });

      if (productsCount > 0) {
        return {
          success: false,
          message: `Kategori tidak dapat dihapus karena digunakan oleh ${productsCount} produk`,
        };
      }

      await db.category.delete({
        where: { id },
      });

      return {
        success: true,
        message: "Kategori berhasil dihapus",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Gagal menghapus kategori",
      };
    }
  },
};
