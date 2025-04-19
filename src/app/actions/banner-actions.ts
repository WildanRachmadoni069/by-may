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

// Helper untuk memverifikasi admin auth
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
 */
export async function createBannerAction(
  data: BannerCreateInput
): Promise<BannerData> {
  // Verify admin authorization
  await checkAdminAuth();

  const banner = await BannerService.createBanner(data);
  revalidatePath("/");
  revalidatePath("/dashboard/admin/banner");
  return banner;
}

/**
 * Memperbarui banner yang sudah ada
 */
export async function updateBannerAction(
  id: string,
  data: BannerUpdateInput
): Promise<BannerData> {
  // Verify admin authorization
  await checkAdminAuth();

  const banner = await BannerService.updateBanner(id, data);
  revalidatePath("/");
  revalidatePath("/dashboard/admin/banner");
  return banner;
}

/**
 * Menghapus banner
 */
export async function deleteBannerAction(id: string): Promise<void> {
  // Verify admin authorization
  await checkAdminAuth();

  await BannerService.deleteBanner(id);
  revalidatePath("/");
  revalidatePath("/dashboard/admin/banner");
}

/**
 * Mengambil semua banner
 */
export async function getBannersAction(): Promise<BannerData[]> {
  return await BannerService.getBanners();
}

/**
 * Mengambil banner berdasarkan ID
 */
export async function getBannerByIdAction(
  id: string
): Promise<BannerData | null> {
  return await BannerService.getBannerById(id);
}

/**
 * Mengambil banner yang aktif saja
 */
export async function getActiveBannersAction(): Promise<BannerData[]> {
  return await BannerService.getActiveBanners();
}
