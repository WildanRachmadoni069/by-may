/**
 * Layanan Cloudinary
 *
 * Layanan untuk mengelola operasi gambar Cloudinary termasuk:
 * - Penanganan konfigurasi
 * - Penguraian URL gambar
 * - Operasi penghapusan
 * - Ekstraksi gambar dari konten HTML
 */

import { v2 as cloudinary } from "cloudinary";

export const CloudinaryService = {
  /**
   * Konfigurasi Cloudinary dengan variabel lingkungan
   * @returns Instance Cloudinary yang telah dikonfigurasi
   */
  init() {
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    return cloudinary;
  },

  /**
   * Mengekstrak public_id dari URL Cloudinary
   * @param url URL gambar Cloudinary
   * @returns public_id atau null jika tidak valid
   */
  extractPublicIdFromUrl(url: string): string | null {
    try {
      if (!url) return null;

      // Match pattern for Cloudinary URLs
      // Example: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/filename.jpg
      const match = url.match(/\/v\d+\/(.+?)(?:\.[^.]+)?$/);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Legacy method for backward compatibility
   * @deprecated Use extractPublicIdFromUrl instead
   */
  extractPublicId(url: string): string | null {
    return this.extractPublicIdFromUrl(url);
  },

  /**
   * Hapus gambar dari Cloudinary berdasarkan URL
   * @param url - URL gambar Cloudinary
   * @returns Promise yang menyelesaikan ke boolean yang menunjukkan keberhasilan
   */
  async deleteImageByUrl(url: string): Promise<boolean> {
    if (!url) return false;

    try {
      // First try server-side deletion if in server context
      if (typeof window === "undefined") {
        const client = this.init();
        const publicId = this.extractPublicIdFromUrl(url);

        if (!publicId) {
          return false;
        }

        const result = await client.uploader.destroy(publicId);
        return result.result === "ok" || result.result === "not found";
      }
      // Otherwise use API endpoint for client-side requests
      else {
        const publicId = this.extractPublicIdFromUrl(url);
        if (!publicId) return false;

        // Call the API to delete the image
        const response = await fetch("/api/cloudinary/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        });

        return response.ok;
      }
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
      return false;
    }
  },

  /**
   * Ekstrak semua URL gambar Cloudinary dari konten HTML
   * @param html Konten HTML yang mungkin berisi gambar Cloudinary
   * @returns Array URL gambar
   */
  extractCloudinaryImagesFromHtml(html: string): string[] {
    if (!html) return [];

    try {
      const cloudinaryDomain = process.env.CLOUDINARY_CLOUD_NAME
        ? `res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}`
        : "res.cloudinary.com";

      // Dual approach to match images:

      // 1. Match image tags with src attributes
      const imgRegex = /<img[^>]+src="([^">]+)"/g;
      const imgMatches: string[] = [];
      let match;

      while ((match = imgRegex.exec(html)) !== null) {
        const url = match[1];
        if (url.includes("cloudinary.com")) {
          imgMatches.push(url);
        }
      }

      // 2. Direct URL matching as fallback
      const directUrlRegex = new RegExp(
        `https?:\/\/${cloudinaryDomain}\/[^'"\\s]+`,
        "g"
      );
      const directMatches = html.match(directUrlRegex) || [];

      // Combine and deduplicate results
      return Array.from(new Set([...imgMatches, ...directMatches]));
    } catch (error) {
      console.error("Error extracting images from HTML:", error);
      return [];
    }
  },
};
