"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  Article,
  ArticleCreateInput,
  ArticleUpdateInput,
} from "@/lib/api/articles";

// These server actions can be imported and used directly in React Server Components
// or called from Client Components using the "use server" form actions

/**
 * Server action to create a new article
 * Use this in server components or through form actions
 */
export async function createArticleAction(
  data: ArticleCreateInput
): Promise<Article> {
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

  // Revalidate the article pages to reflect the new changes
  revalidatePath("/artikel");
  revalidatePath(`/artikel/${article.slug}`);

  return article as Article;
}

/**
 * Server action to update an existing article
 * Use this in server components or through form actions
 */
export async function updateArticleAction(
  slug: string,
  data: ArticleUpdateInput
): Promise<Article> {
  // Check if article exists
  const existingArticle = await db.article.findUnique({
    where: { slug },
  });

  if (!existingArticle) {
    throw new Error("Article not found");
  }

  // Handle publishing status change
  if (data.status === "published" && existingArticle.status !== "published") {
    data.publishedAt = new Date();
  }

  // Update the article
  const updatedArticle = await db.article.update({
    where: { slug },
    data: data as any,
  });

  // Revalidate the article pages to reflect the changes
  revalidatePath("/artikel");
  revalidatePath(`/artikel/${slug}`);

  return updatedArticle as Article;
}

/**
 * Server action to delete an article
 * Use this in server components or through form actions
 */
export async function deleteArticleAction(slug: string): Promise<void> {
  await db.article.delete({
    where: { slug },
  });

  revalidatePath("/artikel");
}

// Add a new function to safely fetch articles with better error handling
export async function getArticleAction(slug: string): Promise<Article | null> {
  try {
    const article = await db.article.findUnique({
      where: { slug },
    });

    return article as Article | null;
  } catch (error) {
    console.error(`Error fetching article with slug ${slug}:`, error);
    return null;
  }
}

// Add a function to fetch multiple articles with error handling
export async function getArticlesAction(
  options: {
    status?: "draft" | "published";
    page?: number;
    limit?: number;
  } = {}
): Promise<{ data: Article[]; pagination: any } | null> {
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
    return null;
  }
}
