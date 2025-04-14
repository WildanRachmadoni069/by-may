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
    const { status, page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const articles = await db.article.findMany({
      where,
      take: limit,
      skip,
      orderBy: { createdAt: "desc" },
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
   * Menghapus artikel dan featured image-nya jika ada
   */
  async deleteArticle(slug: string): Promise<void> {
    const article = await db.article.findUnique({
      where: { slug },
    });

    if (!article) {
      throw new Error("Article not found");
    }

    await db.article.delete({
      where: { slug },
    });

    // Handle featured image deletion
    if (article.featured_image && typeof article.featured_image === "object") {
      const imageObject = article.featured_image as { url?: string };

      if (imageObject.url) {
        await this.deleteCloudinaryImage(imageObject.url);
      }
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
