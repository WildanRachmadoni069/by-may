/**
 * Layanan Artikel (Article Service)
 *
 * Layanan ini bertanggung jawab untuk menangani semua operasi terkait artikel
 * termasuk operasi CRUD, pengambilan data dengan paginasi dan filter,
 * serta pengelolaan gambar artikel.
 */

import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { CloudinaryService } from "./cloudinary-service";
import { ArticleData, ArticleFormData } from "@/types/article";
import { PaginationResult } from "@/lib/api/articles";

export const ArticleService = {
  /**
   * Mengambil artikel berdasarkan slug
   * @param slug - Slug artikel
   * @returns Artikel yang ditemukan atau null jika tidak ada
   */
  async getArticleBySlug(slug: string): Promise<ArticleData | null> {
    const article = await db.article.findUnique({
      where: { slug },
    });

    if (!article) return null;

    return article as unknown as ArticleData;
  },

  /**
   * Mengambil daftar artikel dengan paginasi dan filter
   * @param options - Opsi filter dan paginasi
   * @returns Artikel terpaginasi dan metadata
   */
  async getArticles(
    options: {
      status?: "draft" | "published";
      page?: number;
      limit?: number;
      search?: string;
      sort?: "asc" | "desc";
    } = {}
  ): Promise<PaginationResult<ArticleData>> {
    const { status, page = 1, limit = 10, search, sort = "desc" } = options;

    // Membangun filter query
    const where: any = {};
    if (status) where.status = status;

    // Menambahkan fungsionalitas pencarian jika query disediakan
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }

    // Menghitung total artikel yang sesuai untuk paginasi
    const totalCount = await db.article.count({ where });

    // Mengambil artikel dengan paginasi
    const articles = await db.article.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: sort === "asc" ? "asc" : "desc" },
    });

    return {
      data: articles as unknown as ArticleData[],
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  },

  /**
   * Helper untuk memproses field JSON dengan nilai null
   * @param value - Nilai yang mungkin null
   * @returns Nilai yang diformat untuk Prisma JSON
   */
  _processJsonField<T>(
    value: T | null | undefined
  ): T | typeof Prisma.JsonNull | undefined {
    if (value === null) {
      return Prisma.JsonNull;
    }
    return value;
  },

  /**
   * Membuat artikel baru
   * @param data - Data artikel
   * @returns Artikel yang dibuat
   */
  async createArticle(data: ArticleFormData): Promise<ArticleData> {
    // Memproses metadata
    const meta = data.meta || {
      title: data.title,
      description: data.excerpt || "",
    };

    // Atur tanggal publikasi jika status adalah published
    const publishedAt = data.status === "published" ? new Date() : null;

    // Format fields untuk Prisma
    const featuredImage = this._processJsonField(data.featuredImage);
    const author = this._processJsonField(data.author);

    const article = await db.article.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        featuredImage,
        status: data.status,
        meta,
        author,
        publishedAt,
      },
    });

    return article as unknown as ArticleData;
  },

  /**
   * Memperbarui artikel yang sudah ada
   * @param slug - Slug artikel yang akan diperbarui
   * @param data - Data artikel yang diperbarui
   * @returns Artikel yang telah diperbarui
   */
  async updateArticle(
    slug: string,
    data: Partial<ArticleFormData>
  ): Promise<ArticleData> {
    // Dapatkan artikel yang ada
    const existingArticle = await db.article.findUnique({
      where: { slug },
    });

    if (!existingArticle) {
      throw new Error("Artikel tidak ditemukan");
    }

    // Perbarui tanggal publikasi jika statusnya berubah menjadi published
    let publishedAt = existingArticle.publishedAt;
    if (data.status === "published" && existingArticle.status !== "published") {
      publishedAt = new Date();
    }

    // Proses fields JSON untuk kompatibilitas Prisma
    let updateData: any = { ...data };

    if ("featuredImage" in data) {
      updateData.featuredImage = this._processJsonField(data.featuredImage);
    }

    if ("author" in data) {
      updateData.author = this._processJsonField(data.author);
    }

    // Tangani perubahan gambar featured dan pembersihan
    if (
      data.featuredImage &&
      existingArticle.featuredImage &&
      typeof existingArticle.featuredImage === "object" &&
      (existingArticle.featuredImage as any).url !== data.featuredImage.url
    ) {
      try {
        // Hapus gambar featured lama jika ada dan sedang diubah
        if ((existingArticle.featuredImage as any).url) {
          await CloudinaryService.deleteImageByUrl(
            (existingArticle.featuredImage as any).url
          );
        }
      } catch (error) {
        // Log tapi lanjutkan dengan pembaruan
      }
    }

    // Lakukan pembaruan
    const updatedArticle = await db.article.update({
      where: { slug },
      data: {
        ...updateData,
        publishedAt,
        // Jika slug berubah, perbarui
        ...(data.slug && data.slug !== slug ? { slug: data.slug } : {}),
      },
    });

    return updatedArticle as unknown as ArticleData;
  },

  /**
   * Menghapus artikel dan gambar terkait
   * @param slug - Slug artikel yang akan dihapus
   */
  async deleteArticle(slug: string): Promise<void> {
    const article = await db.article.findUnique({
      where: { slug },
    });

    if (!article) {
      throw new Error("Artikel tidak ditemukan");
    }

    // Ekstrak gambar dari konten sebelum menghapus artikel
    const contentImages = CloudinaryService.extractCloudinaryImagesFromHtml(
      article.content
    );

    await db.article.delete({
      where: { slug },
    });

    // Tangani penghapusan gambar featured
    if (article.featuredImage && typeof article.featuredImage === "object") {
      const imageObject = article.featuredImage as { url?: string };

      if (imageObject.url) {
        await CloudinaryService.deleteImageByUrl(imageObject.url);
      }
    }

    // Hapus semua gambar konten
    if (contentImages.length > 0) {
      // Hapus gambar secara paralel untuk kinerja yang lebih baik
      await Promise.allSettled(
        contentImages.map((imageUrl) =>
          CloudinaryService.deleteImageByUrl(imageUrl)
        )
      );
    }
  },
};
