/**
 * Layanan Cloudinary
 *
 * Layanan untuk mengelola operasi gambar Cloudinary tanpa ketergantungan pada SDK Node.js.
 * Dirancang untuk bekerja di sisi server dan browser.
 */

import { getBaseUrl } from "../utils/url";

export const CloudinaryService = {
  /**
   * Ekstraksi public ID dari URL Cloudinary
   * Fungsi ini menggunakan regex untuk mendapatkan ID publik dari URL Cloudinary
   *
   * @param url URL gambar Cloudinary
   * @returns Public ID atau null jika tidak dapat diekstrak
   */
  extractPublicIdFromUrl(url: string): string | null {
    try {
      if (!url || typeof url !== "string") return null;

      // Handle URLs dengan atau tanpa parameter transformasi
      // Pattern: https://res.cloudinary.com/[cloud-name]/image/upload/[optional-transform]/[folder]/[filename]

      // Periksa apakah URL dari Cloudinary
      if (!url.includes("cloudinary.com")) {
        return null;
      }

      // Ekstrak bagian setelah /upload/
      // Perbaikan: Tangani versi dengan lebih tepat (v1234567890)
      const uploadMatch = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
      if (!uploadMatch || !uploadMatch[1]) {
        return null;
      }

      // Dapatkan public ID - ini adalah semua setelah /upload/vXXX/ dan sebelum ekstensi file
      let publicId = uploadMatch[1];

      // Periksa jika ini adalah URL dengan transformasi (contoh: w_200,h_300/folder/file)
      const firstSlashIndex = publicId.indexOf("/");
      if (firstSlashIndex > 0) {
        const firstPart = publicId.substring(0, firstSlashIndex);

        // Jika bagian pertama mengandung koma atau underscore, kemungkinan itu adalah transformasi
        // Contoh: w_200,h_300,c_crop/folder/file
        if (
          firstPart.includes(",") ||
          (firstPart.includes("_") && /[a-z]_\d/.test(firstPart))
        ) {
          // Format transformasi biasanya seperti w_200
          publicId = publicId.substring(firstSlashIndex + 1);
        }
      }

      // Hapus ekstensi file jika ada
      if (publicId.includes(".")) {
        publicId = publicId.substring(0, publicId.lastIndexOf("."));
      }

      return publicId;
    } catch (error) {
      return null;
    }
  },

  /**
   * Metode lama untuk kompatibilitas
   * @deprecated Gunakan extractPublicIdFromUrl sebagai gantinya
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
    if (!url) {
      return false;
    }

    try {
      const publicId = this.extractPublicIdFromUrl(url);

      if (!publicId) {
        return false;
      }

      // Gunakan URL path yang tepat untuk operasi server-side
      let endpoint = "/api/cloudinary/delete";

      // Saat berjalan di server, kita perlu membuat URL lengkap
      if (typeof window === "undefined") {
        const baseUrl = getBaseUrl();
        endpoint = `${baseUrl}${endpoint}`;
      }

      // Gunakan endpoint API untuk penghapusan gambar
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicId,
          url, // Kirim keduanya untuk ekstraksi cadangan di server jika diperlukan
        }),
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();

      // Bahkan jika Cloudinary mengembalikan "not found", anggap sukses
      // karena gambar sudah tidak ada lagi
      if (result && (result.success || result.result?.result === "not found")) {
        return true;
      }

      return false;
    } catch (error) {
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
      // Karena kita tidak punya akses ke process.env di browser,
      // kita akan mencari domain cloudinary.com
      const cloudinaryDomain = "res.cloudinary.com";

      // Pendekatan ganda untuk mencocokkan gambar:

      // 1. Cocokkan tag gambar dengan atribut src
      const imgRegex = /<img[^>]+src="([^">]+)"/g;
      const imgMatches: string[] = [];
      let match;

      while ((match = imgRegex.exec(html)) !== null) {
        const url = match[1];
        if (url.includes("cloudinary.com")) {
          imgMatches.push(url);
        }
      }

      // 2. Pencocokan URL langsung sebagai fallback
      const directUrlRegex = new RegExp(
        `https?:\/\/${cloudinaryDomain}\/[^'"\\s]+`,
        "g"
      );
      const directMatches = html.match(directUrlRegex) || [];

      // Gabungkan dan hapus duplikasi hasil
      return Array.from(new Set([...imgMatches, ...directMatches]));
    } catch (error) {
      return [];
    }
  },
};
