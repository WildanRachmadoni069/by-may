import { db } from "@/lib/db";
import type {
  Article,
  ArticleCreateInput,
  ArticleUpdateInput,
  PaginationResult,
} from "@/lib/api/articles";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryService } from "./cloudinary-service";

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
      search?: string;
      sort?: "asc" | "desc";
    } = {}
  ): Promise<PaginationResult<Article>> {
    const { status, page = 1, limit = 10, search, sort = "desc" } = options;

    // Build query filters
    const where: any = {};
    if (status) where.status = status;

    // Add search functionality if query provided
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }

    // Count total matching articles for pagination
    const totalCount = await db.article.count({ where });

    // Get articles with pagination
    const articles = await db.article.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: sort === "asc" ? "asc" : "desc" },
    });

    return {
      data: articles as Article[],
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  },

  /**
   * Mengambil artikel berdasarkan slug
   */
  async getArticleBySlug(slug: string): Promise<Article | null> {
    return (await db.article.findUnique({
      where: { slug },
    })) as Article | null;
  },

  /**
   * Membuat artikel baru
   */
  async createArticle(data: ArticleCreateInput): Promise<Article> {
    if (!data.slug) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }

    if (data.status === "published") {
      data.publishedAt = new Date();
    }

    return (await db.article.create({
      data: data as any,
    })) as Article;
  },

  /**
   * Memperbarui artikel yang ada
   */
  async updateArticle(
    slug: string,
    data: ArticleUpdateInput
  ): Promise<Article> {
    const existingArticle = await db.article.findUnique({
      where: { slug },
    });

    if (!existingArticle) {
      throw new Error("Article not found");
    }

    if (data.status === "published" && existingArticle.status !== "published") {
      data.publishedAt = new Date();
    }

    return (await db.article.update({
      where: { slug },
      data: data as any,
    })) as Article;
  },

  /**
   * Menghapus artikel dan gambar-gambarnya
   */
  async deleteArticle(slug: string): Promise<void> {
    const article = await db.article.findUnique({
      where: { slug },
    });

    if (!article) {
      throw new Error("Article not found");
    }

    // Extract images from content before deleting the article
    const contentImages = CloudinaryService.extractCloudinaryImagesFromHtml(
      article.content
    );

    await db.article.delete({
      where: { slug },
    });

    // Handle featured image deletion
    if (article.featured_image && typeof article.featured_image === "object") {
      const imageObject = article.featured_image as { url?: string };

      if (imageObject.url) {
        await CloudinaryService.deleteImageByUrl(imageObject.url);
      }
    }

    // Delete all content images
    if (contentImages.length > 0) {
      console.log(
        `Deleting ${contentImages.length} content images from article ${slug}`
      );

      // Delete images in parallel for better performance
      await Promise.allSettled(
        contentImages.map((imageUrl) =>
          CloudinaryService.deleteImageByUrl(imageUrl)
        )
      );
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
        if (
          url.includes("cloudinary.com") &&
          url.includes("/article-content/")
        ) {
          images.push(url);
        }
      }
    } catch (error) {
      console.error("Error extracting images from HTML:", error);
    }

    return images;
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
