/**
 * Banner Service
 *
 * Service untuk mengelola banner pada aplikasi.
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
   */
  async getBanners(): Promise<BannerData[]> {
    return db.banner.findMany({
      orderBy: { createdAt: "desc" },
    }) as unknown as BannerData[];
  },

  /**
   * Mengambil banner berdasarkan ID
   */
  async getBannerById(id: string): Promise<BannerData | null> {
    const banner = await db.banner.findUnique({
      where: { id },
    });

    return banner as unknown as BannerData | null;
  },

  /**
   * Membuat banner baru
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
   */
  async updateBanner(id: string, data: BannerUpdateInput): Promise<BannerData> {
    const existingBanner = await db.banner.findUnique({
      where: { id },
    });

    if (!existingBanner) {
      throw new Error("Banner tidak ditemukan");
    }

    // Handle image replacement if needed
    if (data.imageUrl && data.imageUrl !== existingBanner.imageUrl) {
      try {
        // Delete the old image
        await CloudinaryService.deleteImageByUrl(existingBanner.imageUrl);
      } catch (error) {
        console.error("Error deleting old banner image:", error);
        // Continue with update even if image deletion fails
      }
    }

    return db.banner.update({
      where: { id },
      data,
    }) as unknown as BannerData;
  },

  /**
   * Menghapus banner dan gambar terkait
   */
  async deleteBanner(id: string): Promise<void> {
    const banner = await db.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      throw new Error("Banner tidak ditemukan");
    }

    // Delete the banner from the database
    await db.banner.delete({
      where: { id },
    });

    // Delete the associated image from Cloudinary
    try {
      await CloudinaryService.deleteImageByUrl(banner.imageUrl);
    } catch (error) {
      console.error("Error deleting banner image from Cloudinary:", error);
      // Continue even if image deletion fails
    }
  },

  /**
   * Mengambil banner yang aktif saja
   */
  async getActiveBanners(): Promise<BannerData[]> {
    return db.banner.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    }) as unknown as BannerData[];
  },
};
