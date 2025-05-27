"use server";

/**
 * Server Actions untuk Category
 *
 * File ini berisi server actions untuk operasi kategori produk.
 * Fungsi-fungsi ini digunakan untuk operasi server-side langsung dari
 * Server dan Client Components.
 */

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { CategoryService } from "@/lib/services/category-service";
import {
  CategoryData,
  CategoryCreateInput,
  CategoryUpdateInput,
} from "@/types/category";
import { ApiResponse } from "@/types/common";
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
 * Membuat kategori baru
 * @param data Data kategori yang akan dibuat
 * @returns Kategori yang dibuat
 * @throws Error jika tidak terautentikasi atau terjadi kesalahan
 */
export async function createCategoryAction(
  data: CategoryCreateInput
): Promise<ApiResponse<CategoryData>> {
  try {
    // Verifikasi autentikasi admin
    await checkAdminAuth();
    const response = await CategoryService.createCategory(data);
    if (response.success) {
      revalidatePath("/produk");
      revalidatePath("/dashboard/admin/product/category");
    }
    return response;
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal membuat kategori",
    };
  }
}

/**
 * Memperbarui kategori yang sudah ada
 * @param id ID kategori yang akan diperbarui
 * @param data Data kategori yang diperbarui
 * @returns Kategori yang diperbarui
 * @throws Error jika tidak terautentikasi atau terjadi kesalahan
 */
export async function updateCategoryAction(
  id: string,
  data: CategoryUpdateInput
): Promise<ApiResponse<CategoryData>> {
  try {
    // Verifikasi autentikasi admin
    await checkAdminAuth();
    const response = await CategoryService.updateCategory(id, data);
    if (response.success) {
      revalidatePath("/produk");
      revalidatePath("/dashboard/admin/product/category");
    }
    return response;
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal memperbarui kategori",
    };
  }
}

/**
 * Menghapus kategori
 * @param id ID kategori yang akan dihapus
 * @returns Objek yang berisi status keberhasilan dan pesan opsional
 * @throws Error jika tidak terautentikasi
 */
export async function deleteCategoryAction(id: string): Promise<ApiResponse> {
  try {
    // Verifikasi autentikasi admin
    await checkAdminAuth();
    const response = await CategoryService.deleteCategory(id);
    if (response.success) {
      revalidatePath("/produk");
      revalidatePath("/dashboard/admin/product/category");
    }
    return response;
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal menghapus kategori",
    };
  }
}

/**
 * Mengambil semua kategori
 * @returns Array kategori
 */
export async function getCategoriesAction(): Promise<
  ApiResponse<CategoryData[]>
> {
  try {
    return await CategoryService.getCategories();
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal mengambil daftar kategori",
    };
  }
}

/**
 * Mengambil kategori berdasarkan ID
 * @param id ID kategori yang dicari
 * @returns Kategori yang ditemukan atau null
 */
export async function getCategoryByIdAction(
  id: string
): Promise<ApiResponse<CategoryData>> {
  try {
    return await CategoryService.getCategoryById(id);
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal mengambil detail kategori",
    };
  }
}
