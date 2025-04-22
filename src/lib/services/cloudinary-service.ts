/**
 * Layanan Cloudinary
 *
 * Layanan untuk mengelola operasi gambar Cloudinary tanpa ketergantungan pada SDK Node.js.
 * Dirancang untuk bekerja di sisi server dan browser.
 */

export const CloudinaryService = {
  /**
   * Extracts the public ID from a Cloudinary URL
   * Enhanced with better regex patterns
   */
  extractPublicIdFromUrl(url: string): string | null {
    try {
      if (!url || typeof url !== "string") return null;

      // Handle URLs with or without transformation parameters
      // Match pattern: https://res.cloudinary.com/[cloud-name]/image/upload/[optional-transform]/[folder]/[filename]

      // First, check if it's a Cloudinary URL
      if (!url.includes("cloudinary.com")) {
        return null;
      }

      // Extract the part after /upload/
      const uploadMatch = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
      if (!uploadMatch || !uploadMatch[1]) {
        return null;
      }

      // Remove any transformation parameters and file extension
      let publicId = uploadMatch[1];

      // Remove transformation parameters if any
      if (publicId.includes("/")) {
        const parts = publicId.split("/");
        if (parts[0].includes(",") || parts[0].includes("_")) {
          // This might be a transformation parameter
          publicId = parts.slice(1).join("/");
        }
      }

      // Remove file extension if present
      if (publicId.includes(".")) {
        publicId = publicId.substring(0, publicId.lastIndexOf("."));
      }

      return publicId;
    } catch (error) {
      console.error("Error extracting public ID:", error);
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
    if (!url) {
      console.log("Empty URL provided to deleteImageByUrl");
      return false;
    }

    try {
      const publicId = this.extractPublicIdFromUrl(url);

      if (!publicId) {
        console.error("Failed to extract public ID from URL:", url);
        return false;
      }

      // Fix: Use absolute URL path with origin for server-side operations
      // This ensures the fetch works in both browser and Node.js environments
      let endpoint = "/api/cloudinary/delete";

      // When running on the server, we need to construct a full URL
      if (typeof window === "undefined") {
        const baseUrl =
          process.env.NEXTAUTH_URL ||
          process.env.VERCEL_URL ||
          "http://localhost:3000";
        endpoint = `${baseUrl}${endpoint}`;
      }

      // Use the API endpoint for image deletion
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicId,
          url, // Send both for backup extraction on server if needed
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response from Cloudinary delete API:", errorData);
        return false;
      }

      const result = await response.json();

      // Even if Cloudinary returns "not found", consider it a success
      // since the image is no longer there
      if (result && (result.success || result.result?.result === "not found")) {
        return true;
      }

      return false;
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
