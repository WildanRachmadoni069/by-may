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
   * Delete an image from Cloudinary by URL
   */
  async deleteImageByUrl(url: string): Promise<boolean> {
    try {
      const client = this.init();

      const urlParts = url.split("/");
      const publicIdWithExtension = urlParts.pop();

      if (!publicIdWithExtension) {
        throw new Error("Invalid Cloudinary URL format");
      }

      const publicId = publicIdWithExtension.split(".")[0];

      const result = await client.uploader.destroy(publicId);

      return result.result === "ok" || result.result === "not found";
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
      return false;
    }
  },
};
