import { prisma } from "@/lib/db";
import type { ArticleData } from "@/types/article";

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

export const generateExcerpt = (content: string): string => {
  const textWithSpaces = content.replace(/<\//g, " </");
  const plainText = textWithSpaces
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .replace(/\n+/g, " ")
    .trim();
  return plainText.length > 150
    ? `${plainText.substring(0, 150)}...`
    : plainText;
};

// Get all published articles
export async function getPublishedArticles(): Promise<ArticleData[]> {
  const articles = await prisma.article.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
  });

  return articles.map(formatArticleResponse);
}

// Get article by slug
export async function getArticleBySlug(
  slug: string
): Promise<ArticleData | null> {
  const article = await prisma.article.findFirst({
    where: {
      slug,
      status: "published",
    },
  });

  if (!article) return null;

  return formatArticleResponse(article);
}

// Get all articles (including drafts) - for admin
export async function getAllArticles(): Promise<ArticleData[]> {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
  });

  return articles.map(formatArticleResponse);
}

// Create new article
export async function createArticle(
  articleData: Omit<ArticleData, "id" | "created_at" | "updated_at">
): Promise<ArticleData> {
  const { author, featured_image, meta, ...rest } = articleData;

  const article = await prisma.article.create({
    data: {
      ...rest,
      author: author as any,
      featured_image: featured_image as any,
      meta: meta as any,
    },
  });

  return formatArticleResponse(article);
}

// Update article
export async function updateArticle(
  id: string,
  articleData: Partial<ArticleData>
): Promise<ArticleData> {
  const { author, featured_image, meta, ...rest } = articleData;

  const article = await prisma.article.update({
    where: { id },
    data: {
      ...rest,
      ...(author && { author: author as any }),
      ...(featured_image && { featured_image: featured_image as any }),
      ...(meta && { meta: meta as any }),
    },
  });

  return formatArticleResponse(article);
}

// Delete article
export async function deleteArticle(id: string): Promise<void> {
  await prisma.article.delete({
    where: { id },
  });
}

// Helper: Format article from DB to expected ArticleData format
function formatArticleResponse(dbArticle: any): ArticleData {
  return {
    id: dbArticle.id,
    title: dbArticle.title,
    slug: dbArticle.slug,
    content: dbArticle.content,
    excerpt: dbArticle.excerpt || "",
    featured_image: dbArticle.featured_image as {
      url: string;
      alt: string;
    },
    status: dbArticle.status as "draft" | "published",
    meta: dbArticle.meta as {
      title: string;
      description: string;
      og_image: string;
    },
    author: dbArticle.author as { id: string; name: string },
    created_at: dbArticle.createdAt ? dbArticle.createdAt.toISOString() : null,
    updated_at: dbArticle.updatedAt ? dbArticle.updatedAt.toISOString() : null,
  };
}
