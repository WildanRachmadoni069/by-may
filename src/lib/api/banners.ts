/**
 * Banner API Client
 *
 * Fungsi-fungsi untuk interaksi dengan Banner API dari client components.
 */

import {
  BannerData,
  BannerCreateInput,
  BannerUpdateInput,
} from "@/types/banner";

/**
 * Mengambil semua banner
 */
export async function getBanners(): Promise<BannerData[]> {
  const res = await fetch("/api/banners", {
    next: { tags: ["banners"] },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to fetch banners");
  }

  return res.json();
}

/**
 * Mengambil banner berdasarkan ID
 */
export async function getBannerById(id: string): Promise<BannerData> {
  const res = await fetch(`/api/banners/${id}`, {
    next: { tags: [`banner-${id}`] },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to fetch banner");
  }

  return res.json();
}

/**
 * Membuat banner baru
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
    throw new Error(error || "Failed to create banner");
  }

  return res.json();
}

/**
 * Memperbarui banner yang sudah ada
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
    throw new Error(error || "Failed to update banner");
  }

  return res.json();
}

/**
 * Menghapus banner
 */
export async function deleteBanner(id: string): Promise<void> {
  const res = await fetch(`/api/banners/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to delete banner");
  }
}
