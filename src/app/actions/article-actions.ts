"use server";

/**
 * Server Actions untuk Artikel
 *
 * File ini berisi server actions untuk operasi artikel.
 * Fungsi-fungsi ini digunakan untuk operasi server-side langsung dari
 * Server dan Client Components.
 */

import { revalidatePath } from "next/cache";
import {
  Article,
  ArticleCreateInput,
  ArticleUpdateInput,
  PaginationResult,
} from "@/lib/api/articles";
import { ArticleService } from "@/lib/services/article-service";

/**
 * Membuat artikel baru
 * @param data Data artikel yang akan dibuat
 * @returns Artikel yang dibuat
 */
export async function createArticleAction(
  data: ArticleCreateInput
): Promise<Article> {
  const article = await ArticleService.createArticle(data);
  revalidatePath("/artikel");
  revalidatePath(`/artikel/${article.slug}`);
  return article;
}

/**
 * Memperbarui artikel yang sudah ada
 * @param slug Slug artikel yang akan diperbarui
 * @param data Data artikel yang diperbarui
 * @returns Artikel yang diperbarui
 */
export async function updateArticleAction(
  slug: string,
  data: ArticleUpdateInput
): Promise<Article> {
  const updatedArticle = await ArticleService.updateArticle(slug, data);
  revalidatePath("/artikel");
  revalidatePath(`/artikel/${slug}`);
  return updatedArticle;
}

/**
 * Menghapus artikel dan gambar terkait
 * @param slug Slug artikel yang akan dihapus
 */
export async function deleteArticleAction(slug: string): Promise<void> {
  await ArticleService.deleteArticle(slug);
  revalidatePath("/artikel");
}

/**
 * Mengambil artikel berdasarkan slug
 * @param slug Slug artikel yang dicari
 * @returns Artikel atau null jika tidak ditemukan
 */
export async function getArticleAction(slug: string): Promise<Article | null> {
  return await ArticleService.getArticleBySlug(slug);
}

/**
 * Mengambil artikel terpaginasi dengan opsi filter
 * @param options Opsi filter dan paginasi
 * @returns Artikel terpaginasi dan metadata
 */
export async function getArticlesAction(
  options: {
    status?: "draft" | "published";
    page?: number;
    limit?: number;
    search?: string;
  } = {}
): Promise<PaginationResult<Article>> {
  return await ArticleService.getArticles(options);
}
