"use server";

import { revalidatePath } from "next/cache";
import {
  Article,
  ArticleCreateInput,
  ArticleUpdateInput,
  PaginationResult,
} from "@/lib/api/articles";
import { ArticleService } from "@/lib/services/article-service";

/**
 * Server action untuk membuat artikel baru
 */
export async function createArticleAction(
  data: ArticleCreateInput
): Promise<Article> {
  // Gunakan service untuk membuat artikel
  const article = await ArticleService.createArticle(data);

  // Revalidate paths
  revalidatePath("/artikel");
  revalidatePath(`/artikel/${article.slug}`);

  return article;
}

/**
 * Server action untuk memperbarui artikel
 */
export async function updateArticleAction(
  slug: string,
  data: ArticleUpdateInput
): Promise<Article> {
  // Gunakan service untuk memperbarui artikel
  const updatedArticle = await ArticleService.updateArticle(slug, data);

  // Revalidate paths
  revalidatePath("/artikel");
  revalidatePath(`/artikel/${slug}`);

  return updatedArticle;
}

/**
 * Server action untuk menghapus artikel
 */
export async function deleteArticleAction(slug: string): Promise<void> {
  // Gunakan service untuk menghapus artikel
  await ArticleService.deleteArticle(slug);

  // Revalidate paths
  revalidatePath("/artikel");
}

/**
 * Server action untuk mengambil artikel berdasarkan slug
 */
export async function getArticleAction(slug: string): Promise<Article | null> {
  return await ArticleService.getArticleBySlug(slug);
}

/**
 * Server action untuk mengambil daftar artikel
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
