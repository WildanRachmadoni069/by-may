/**
 * Banner Service
 *
 * Layanan untuk mengelola banner pada aplikasi.
 * Menyediakan fungsi-fungsi CRUD untuk banner.
 */

import { db } from "@/lib/db";
import { CloudinaryService } from "./cloudinary-service";
import {
  BannerData,
  BannerCreateInput,
  BannerUpdateInput,
} from "@/types/banner";

export const BannerService = {
  /**
   * Mengambil semua banner
   * @returns Promise yang menyelesaikan ke array banner
   */
  async getBanners(): Promise<BannerData[]> {
    return db.banner.findMany({
      orderBy: { createdAt: "desc" },
    }) as unknown as BannerData[];
  },

  /**
   * Mengambil banner berdasarkan ID
   * @param id ID banner yang dicari
   * @returns Banner yang ditemukan atau null
   */
  async getBannerById(id: string): Promise<BannerData | null> {
    const banner = await db.banner.findUnique({
      where: { id },
    });

    return banner as unknown as BannerData | null;
  },

  /**
   * Membuat banner baru
   * @param data Data banner yang akan dibuat
   * @returns Banner yang dibuat
   */
  async createBanner(data: BannerCreateInput): Promise<BannerData> {
    return db.banner.create({
      data: {
        title: data.title,
        imageUrl: data.imageUrl,
        url: data.url || null,
        active: data.active,
      },
    }) as unknown as BannerData;
  },

  /**
   * Memperbarui banner yang sudah ada
   * @param id ID banner yang akan diperbarui
   * @param data Data banner yang diperbarui
   * @returns Banner yang diperbarui
   */
  async updateBanner(id: string, data: BannerUpdateInput): Promise<BannerData> {
    const existingBanner = await db.banner.findUnique({
      where: { id },
    });

    if (!existingBanner) {
      throw new Error("Banner tidak ditemukan");
    }

    // Tangani penggantian gambar jika diperlukan
    if (data.imageUrl && data.imageUrl !== existingBanner.imageUrl) {
      try {
        // Hapus gambar lama
        await CloudinaryService.deleteImageByUrl(existingBanner.imageUrl);
      } catch (error) {
        // Lanjutkan dengan update meskipun penghapusan gambar gagal
      }
    }

    return db.banner.update({
      where: { id },
      data,
    }) as unknown as BannerData;
  },

  /**
   * Menghapus banner dan gambar terkait
   * @param id ID banner yang akan dihapus
   */
  async deleteBanner(id: string): Promise<void> {
    const banner = await db.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      throw new Error("Banner tidak ditemukan");
    }

    // Hapus banner dari database
    await db.banner.delete({
      where: { id },
    });

    // Hapus gambar terkait dari Cloudinary
    try {
      await CloudinaryService.deleteImageByUrl(banner.imageUrl);
    } catch (error) {
      // Lanjutkan meskipun penghapusan gambar gagal
    }
  },

  /**
   * Mengambil banner yang aktif saja
   * @returns Array banner yang aktif
   */
  async getActiveBanners(): Promise<BannerData[]> {
    return db.banner.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    }) as unknown as BannerData[];
  },
};
