"use server";

/**
 * Server Actions untuk Banner
 *
 * File ini berisi server actions untuk operasi banner.
 * Fungsi-fungsi ini digunakan untuk operasi server-side langsung dari
 * Server dan Client Components.
 */

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { BannerService } from "@/lib/services/banner-service";
import {
  BannerData,
  BannerCreateInput,
  BannerUpdateInput,
} from "@/types/banner";
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
 * Membuat banner baru
 * @param data Data banner yang akan dibuat
 * @returns Banner yang dibuat
 */
export async function createBannerAction(
  data: BannerCreateInput
): Promise<BannerData> {
  // Verifikasi autentikasi admin
  await checkAdminAuth();

  const result = await BannerService.createBanner(data);
  if (!result.success || !result.data) {
    throw new Error(result.message || "Gagal membuat banner");
  }

  revalidatePath("/");
  revalidatePath("/dashboard/admin/banner");
  return result.data;
}

/**
 * Memperbarui banner yang sudah ada
 * @param id ID banner yang akan diperbarui
 * @param data Data banner yang diperbarui
 * @returns Banner yang diperbarui
 */
export async function updateBannerAction(
  id: string,
  data: BannerUpdateInput
): Promise<BannerData> {
  // Convert and sanitize update data
  const updateData: BannerUpdateInput = {};

  if (data.title !== undefined) {
    updateData.title = data.title.trim();
  }
  if (data.imageUrl !== undefined) {
    updateData.imageUrl = data.imageUrl.trim();
  }
  if (data.url !== undefined) {
    updateData.url = data.url ? data.url.trim() || null : null;
  }
  if (data.active !== undefined) {
    updateData.active = data.active;
  }

  // Verifikasi autentikasi admin
  await checkAdminAuth();

  const result = await BannerService.updateBanner(id, updateData);
  if (!result.success || !result.data) {
    throw new Error(result.message || "Gagal memperbarui banner");
  }

  revalidatePath("/");
  revalidatePath("/dashboard/admin/banner");
  return result.data;
}

/**
 * Menghapus banner
 * @param id ID banner yang akan dihapus
 */
export async function deleteBannerAction(id: string): Promise<void> {
  // Verifikasi autentikasi admin
  await checkAdminAuth();

  const result = await BannerService.deleteBanner(id);
  if (!result.success) {
    throw new Error(result.message || "Gagal menghapus banner");
  }

  revalidatePath("/");
  revalidatePath("/dashboard/admin/banner");
}

/**
 * Mengambil semua banner
 * @returns Array banner
 */
export async function getBannersAction(): Promise<BannerData[]> {
  const result = await BannerService.getBanners();
  if (!result.success || !result.data) {
    throw new Error(result.message || "Gagal mengambil data banner");
  }
  return result.data;
}

/**
 * Mengambil banner berdasarkan ID
 * @param id ID banner yang dicari
 * @returns Banner yang ditemukan atau null
 */
export async function getBannerByIdAction(
  id: string
): Promise<BannerData | null> {
  const result = await BannerService.getBannerById(id);
  if (!result.success) {
    throw new Error(result.message || "Gagal mengambil data banner");
  }
  return result.data || null;
}

/**
 * Mengambil banner yang aktif saja
 * @returns Array banner yang aktif
 */
export async function getActiveBannersAction(): Promise<BannerData[]> {
  const result = await BannerService.getBanners();
  if (!result.success || !result.data) {
    throw new Error(result.message || "Gagal mengambil data banner");
  }
  return result.data.filter((banner) => banner.active);
}
