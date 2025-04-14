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
   * Ekstrak public ID dari URL Cloudinary, menangani pola folder yang berbeda
   * @param url - URL gambar Cloudinary
   * @returns String public ID atau null jika URL tidak valid
   */
  extractPublicId(url: string): string | null {
    if (!url) return null;

    // Cocokkan URL dengan struktur folder: /v123456/folder/name.jpg
    const folderMatch = url.match(/\/upload\/v\d+\/([^\.]+)\.\w+$/);
    if (folderMatch && folderMatch[1]) {
      return folderMatch[1];
    }

    // Fallback untuk URL yang lebih sederhana: /v123456/name.jpg
    const simpleMatch = url.match(/\/v\d+\/([^/]+)\.\w+$/);
    return simpleMatch ? simpleMatch[1] : null;
  },

  /**
   * Hapus gambar dari Cloudinary berdasarkan URL
   * @param url - URL gambar Cloudinary
   * @returns Promise yang menyelesaikan ke boolean yang menunjukkan keberhasilan
   */
  async deleteImageByUrl(url: string): Promise<boolean> {
    try {
      const client = this.init();

      const publicId = this.extractPublicId(url);

      if (!publicId) {
        return false;
      }

      const result = await client.uploader.destroy(publicId);

      return result.result === "ok" || result.result === "not found";
    } catch (error) {
      console.error("Kesalahan menghapus gambar dari Cloudinary:", error);
      return false;
    }
  },

  /**
   * Ekstrak semua URL gambar Cloudinary dari konten HTML
   * @param htmlContent - String konten HTML
   * @returns Array URL gambar Cloudinary
   */
  extractCloudinaryImagesFromHtml(htmlContent: string): string[] {
    const images: string[] = [];

    if (!htmlContent) return images;

    try {
      // Gunakan regex untuk menemukan semua tag img
      const imgRegex = /<img[^>]+src="([^">]+)"/g;
      let match;

      while ((match = imgRegex.exec(htmlContent)) !== null) {
        const url = match[1];

        // Hanya tambahkan URL Cloudinary
        if (url.includes("cloudinary.com")) {
          images.push(url);
        }
      }
    } catch (error) {
      console.error("Kesalahan mengekstrak gambar dari HTML:", error);
    }

    return images;
  },
};
