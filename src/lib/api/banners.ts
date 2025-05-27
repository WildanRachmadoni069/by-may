/**
 * Banner API Client
 *
 * Fungsi-fungsi untuk interaksi dengan Banner API dari client components
 */

import {
  BannerData,
  BannerCreateInput,
  BannerUpdateInput,
} from "@/types/banner";
import { ApiResponse } from "@/types/common";

/**
 * Mengambil semua banner
 * @returns Promise yang menyelesaikan ke array banner
 */
export async function getBanners(): Promise<BannerData[]> {
  const res = await fetch("/api/banners", {
    next: { tags: ["banners"] },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Gagal mengambil banner");
  }

  const response: ApiResponse<BannerData[]> = await res.json();
  if (!response.success || !response.data) {
    throw new Error(response.message || "Gagal mengambil banner");
  }

  return response.data;
}

/**
 * Mengambil banner berdasarkan ID
 * @param id ID banner yang dicari
 * @returns Banner yang ditemukan
 */
export async function getBannerById(id: string): Promise<BannerData> {
  const res = await fetch(`/api/banners/${id}`, {
    next: { tags: [`banner-${id}`] },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Gagal mengambil banner");
  }

  const response: ApiResponse<BannerData> = await res.json();
  if (!response.success || !response.data) {
    throw new Error(response.message || "Gagal mengambil banner");
  }

  return response.data;
}

/**
 * Membuat banner baru
 * @param data Data banner yang akan dibuat
 * @returns Banner yang dibuat
 */
export async function createBanner(
  data: BannerCreateInput
): Promise<BannerData> {
  const res = await fetch("/api/banners", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Gagal membuat banner");
  }

  const response: ApiResponse<BannerData> = await res.json();
  if (!response.success || !response.data) {
    throw new Error(response.message || "Gagal membuat banner");
  }

  return response.data;
}

/**
 * Memperbarui banner yang sudah ada
 * @param id ID banner yang akan diperbarui
 * @param data Data banner yang diperbarui
 * @returns Banner yang diperbarui
 */
export async function updateBanner(
  id: string,
  data: BannerUpdateInput
): Promise<BannerData> {
  const res = await fetch(`/api/banners/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Gagal memperbarui banner");
  }

  const response: ApiResponse<BannerData> = await res.json();
  if (!response.success || !response.data) {
    throw new Error(response.message || "Gagal memperbarui banner");
  }

  return response.data;
}

/**
 * Menghapus banner
 * @param id ID banner yang akan dihapus
 */
export async function deleteBanner(id: string): Promise<void> {
  const res = await fetch(`/api/banners/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Gagal menghapus banner");
  }

  const response: ApiResponse<void> = await res.json();
  if (!response.success) {
    throw new Error(response.message || "Gagal menghapus banner");
  }
}
