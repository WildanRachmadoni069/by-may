import { v2 as cloudinary } from "cloudinary";

/**
 * Helper service for Cloudinary operations
 * Centralizes Cloudinary configuration and provides reusable methods
 */
export const CloudinaryService = {
  /**
   * Configure Cloudinary with environment variables
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
   * Extract public ID from Cloudinary URL, handling different folder patterns
   */
  extractPublicId(url: string): string | null {
    if (!url) return null;

    // Match URLs with folder structure: /v123456/folder/name.jpg
    const folderMatch = url.match(/\/upload\/v\d+\/([^\.]+)\.\w+$/);
    if (folderMatch && folderMatch[1]) {
      return folderMatch[1];
    }

    // Fallback for simpler URLs: /v123456/name.jpg
    const simpleMatch = url.match(/\/v\d+\/([^/]+)\.\w+$/);
    return simpleMatch ? simpleMatch[1] : null;
  },

  /**
   * Delete an image from Cloudinary by URL
   */
  async deleteImageByUrl(url: string): Promise<boolean> {
    try {
      const client = this.init();

      const publicId = this.extractPublicId(url);

      if (!publicId) {
        console.error("Invalid Cloudinary URL format:", url);
        return false;
      }

      console.log(
        `Attempting to delete Cloudinary image with public_id: ${publicId}`
      );

      const result = await client.uploader.destroy(publicId);

      console.log(`Cloudinary delete result:`, result);

      return result.result === "ok" || result.result === "not found";
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
      return false;
    }
  },

  /**
   * Extract all Cloudinary image URLs from HTML content
   */
  extractCloudinaryImagesFromHtml(htmlContent: string): string[] {
    const images: string[] = [];

    if (!htmlContent) return images;

    try {
      // Use regex to find all img tags
      const imgRegex = /<img[^>]+src="([^">]+)"/g;
      let match;

      while ((match = imgRegex.exec(htmlContent)) !== null) {
        const url = match[1];

        // Only add Cloudinary URLs
        if (url.includes("cloudinary.com")) {
          images.push(url);
        }
      }
    } catch (error) {
      console.error("Error extracting images from HTML:", error);
    }

    return images;
  },
};
