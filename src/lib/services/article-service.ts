import { db } from "@/lib/db";
import type {
  Article,
  ArticleCreateInput,
  ArticleUpdateInput,
  PaginationResult,
} from "@/lib/api/articles";
import { v2 as cloudinary } from "cloudinary";

// Konfigurasi Cloudinary (server-side)
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
};

/**
 * Service layer untuk menangani operasi pada artikel
 * File ini adalah single-source-of-truth untuk logika database artikel
 * dan dapat digunakan oleh API routes dan server actions
 */
export const ArticleService = {
  /**
   * Mengambil daftar artikel dengan pagination
   */
  async getArticles(
    options: {
      status?: "draft" | "published";
      page?: number;
      limit?: number;
    } = {}
  ): Promise<PaginationResult<Article>> {
    try {
      const { status, page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      // Build query filters
      const where: any = {};
      if (status) where.status = status;

      const articles = await db.article.findMany({
        where,
        take: limit,
        skip,
        orderBy: {
          createdAt: "desc",
        },
      });

      const totalCount = await db.article.count({ where });

      return {
        data: articles as Article[],
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching articles:", error);
      throw new Error("Failed to fetch articles");
    }
  },

  /**
   * Mengambil artikel berdasarkan slug
   */
  async getArticleBySlug(slug: string): Promise<Article | null> {
    try {
      const article = await db.article.findUnique({
        where: { slug },
      });

      return article as Article | null;
    } catch (error) {
      console.error(`Error fetching article with slug ${slug}:`, error);
      return null;
    }
  },

  /**
   * Membuat artikel baru
   */
  async createArticle(data: ArticleCreateInput): Promise<Article> {
    try {
      // Generate slug if not provided
      if (!data.slug) {
        data.slug = data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }

      // Set published date if status is "published"
      if (data.status === "published") {
        data.publishedAt = new Date();
      }

      const article = await db.article.create({
        data: data as any,
      });

      return article as Article;
    } catch (error) {
      console.error("Error creating article:", error);
      throw new Error("Failed to create article");
    }
  },

  /**
   * Memperbarui artikel yang ada
   */
  async updateArticle(
    slug: string,
    data: ArticleUpdateInput
  ): Promise<Article> {
    try {
      // Check if article exists
      const existingArticle = await db.article.findUnique({
        where: { slug },
      });

      if (!existingArticle) {
        throw new Error("Article not found");
      }

      // Handle publishing status change
      if (
        data.status === "published" &&
        existingArticle.status !== "published"
      ) {
        data.publishedAt = new Date();
      }

      // Update the article
      const updatedArticle = await db.article.update({
        where: { slug },
        data: data as any,
      });

      return updatedArticle as Article;
    } catch (error) {
      console.error(`Error updating article with slug ${slug}:`, error);
      throw new Error("Failed to update article");
    }
  },

  /**
   * Menghapus artikel dan featured image-nya jika ada
   */
  async deleteArticle(slug: string): Promise<void> {
    try {
      // First get the article to extract featured image URL
      const article = await db.article.findUnique({
        where: { slug },
      });

      if (!article) {
        throw new Error("Article not found");
      }

      // Delete the article from database
      await db.article.delete({
        where: { slug },
      });

      // If article had a featured image, delete it from Cloudinary
      if (
        article.featured_image &&
        typeof article.featured_image === "object"
      ) {
        try {
          // Parse the featured_image to ensure it has the expected structure
          const imageObject = article.featured_image as { url?: string };

          if (imageObject.url) {
            configureCloudinary();

            // Extract public ID from URL
            const urlParts = imageObject.url.split("/");
            const publicIdWithExtension = urlParts.pop();

            if (publicIdWithExtension) {
              const publicId = publicIdWithExtension.split(".")[0];
              await cloudinary.uploader.destroy(publicId);
            }
          }
        } catch (cloudinaryError) {
          console.error(
            "Failed to delete image from Cloudinary:",
            cloudinaryError
          );
          // Continue execution even if image deletion fails
        }
      }
    } catch (error) {
      console.error(`Error deleting article with slug ${slug}:`, error);
      throw new Error("Failed to delete article");
    }
  },

  /**
   * Menghapus gambar dari Cloudinary
   */
  async deleteCloudinaryImage(url: string): Promise<boolean> {
    try {
      configureCloudinary();

      const urlParts = url.split("/");
      const publicIdWithExtension = urlParts.pop();

      if (!publicIdWithExtension) {
        throw new Error("Invalid Cloudinary URL format");
      }

      const publicId = publicIdWithExtension.split(".")[0];

      const result = await cloudinary.uploader.destroy(publicId);

      return result.result === "ok" || result.result === "not found";
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
      return false;
    }
  },
};
