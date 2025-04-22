/**
 * Layanan Cloudinary
 *
 * Layanan untuk mengelola operasi gambar Cloudinary tanpa ketergantungan pada SDK Node.js.
 * Dirancang untuk bekerja di sisi server dan browser.
 */

export const CloudinaryService = {
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
      const publicId = this.extractPublicIdFromUrl(url);
      if (!publicId) return false;

      // Use the API endpoint for image deletion
      // This works in both server and client environments
      const response = await fetch("/api/cloudinary/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicId }),
      });

      return response.ok;
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
      // Since we don't have access to process.env in browser,
      // we'll just look for the cloudinary.com domain
      const cloudinaryDomain = "res.cloudinary.com";

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
