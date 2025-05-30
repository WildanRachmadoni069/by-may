/**
 * Banner Service
 *
 * Layanan untuk mengelola banner pada aplikasi.
 * Menyediakan fungsi-fungsi CRUD untuk banner.
 */

import { db } from "@/lib/db";
import { CloudinaryService } from "./cloudinary-service";
import { ApiResponse } from "@/types/common";
import { logError } from "@/lib/debug";
import {
  BannerData,
  BannerCreateInput,
  BannerUpdateInput,
} from "@/types/banner";

export const BannerService = {
  /**
   * Mengambil semua banner
   */
  async getBanners(): Promise<ApiResponse<BannerData[]>> {
    try {
      const banners = await db.banner.findMany({
        orderBy: { createdAt: "desc" },
      });

      const formattedBanners = banners.map((banner) => ({
        ...banner,
        createdAt: banner.createdAt.toISOString(),
        updatedAt: banner.updatedAt.toISOString(),
      }));

      return {
        success: true,
        data: formattedBanners,
      };
    } catch (error) {
      logError("BannerService.getBanners", error);
      return {
        success: false,
        message: "Gagal mengambil data banner",
      };
    }
  },

  /**
   * Mengambil banner berdasarkan ID
   */
  async getBannerById(id: string): Promise<ApiResponse<BannerData | null>> {
    try {
      const banner = await db.banner.findUnique({
        where: { id },
      });

      if (!banner) {
        return {
          success: false,
          message: "Banner tidak ditemukan",
        };
      }

      return {
        success: true,
        data: {
          ...banner,
          createdAt: banner.createdAt.toISOString(),
          updatedAt: banner.updatedAt.toISOString(),
        },
      };
    } catch (error) {
      logError("BannerService.getBannerById", error);
      return {
        success: false,
        message: "Gagal mengambil detail banner",
      };
    }
  },

  /**
   * Membuat banner baru
   */
  async createBanner(
    data: BannerCreateInput
  ): Promise<ApiResponse<BannerData>> {
    try {
      // Validate and sanitize input
      const sanitizedData = {
        title: data.title?.trim() || "",
        imageUrl: data.imageUrl?.trim() || "",
        url: data.url?.trim() || null,
        active: Boolean(data.active),
      };

      const banner = await db.banner.create({
        data: sanitizedData,
      });

      return {
        success: true,
        data: {
          ...banner,
          createdAt: banner.createdAt.toISOString(),
          updatedAt: banner.updatedAt.toISOString(),
        },
        message: "Banner berhasil dibuat",
      };
    } catch (error) {
      logError("BannerService.createBanner", error);
      let errorMessage = "Gagal membuat banner";

      if (error instanceof Error) {
        if (error.message.includes("Prisma")) {
          errorMessage = "Terjadi kesalahan pada database";
        } else if (error.message.includes("validation")) {
          errorMessage = "Data banner tidak valid";
        }
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Memperbarui banner yang sudah ada
   */
  async updateBanner(
    id: string,
    data: BannerUpdateInput
  ): Promise<ApiResponse<BannerData>> {
    try {
      const existingBanner = await db.banner.findUnique({
        where: { id },
      });

      if (!existingBanner) {
        return {
          success: false,
          message: "Banner tidak ditemukan",
        };
      }

      const banner = await db.banner.update({
        where: { id },
        data,
      });

      return {
        success: true,
        data: {
          ...banner,
          createdAt: banner.createdAt.toISOString(),
          updatedAt: banner.updatedAt.toISOString(),
        },
        message: "Banner berhasil diperbarui",
      };
    } catch (error) {
      logError("BannerService.updateBanner", error);
      let errorMessage = "Gagal memperbarui banner";

      if (error instanceof Error) {
        if (error.message.includes("Prisma")) {
          errorMessage = "Terjadi kesalahan pada database";
        } else if (error.message.includes("validation")) {
          errorMessage = "Data banner tidak valid";
        }
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Menghapus banner
   */
  async deleteBanner(id: string): Promise<ApiResponse<void>> {
    try {
      const banner = await db.banner.findUnique({
        where: { id },
      });

      if (!banner) {
        return {
          success: false,
          message: "Banner tidak ditemukan",
        };
      }

      // Hapus banner dari database
      await db.banner.delete({
        where: { id },
      });

      // Hapus gambar dari Cloudinary
      try {
        await CloudinaryService.deleteImageByUrl(banner.imageUrl);
      } catch (error) {
        // Lanjutkan meskipun penghapusan gambar gagal
        logError("BannerService.deleteBanner.deleteImage", error);
      }

      return {
        success: true,
        message: "Banner berhasil dihapus",
      };
    } catch (error) {
      logError("BannerService.deleteBanner", error);
      let errorMessage = "Gagal menghapus banner";

      if (error instanceof Error) {
        if (error.message.includes("Prisma")) {
          errorMessage = "Terjadi kesalahan pada database";
        }
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  },
};
