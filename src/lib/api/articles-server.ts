// SERVER-SIDE ONLY - do not import in client components
import { db } from "@/lib/db";
import type { Article, PaginationResult } from "@/lib/api/articles";

// Server-side function to fetch articles with pagination
export async function getArticles(
  options: {
    status?: "draft" | "published";
    page?: number;
    limit?: number;
  } = {}
): Promise<PaginationResult<Article>> {
  const { status, page = 1, limit = 10 } = options;

  // Build query filters
  const filters: any = {};
  if (status) filters.status = status;

  // Get articles with pagination
  const skip = (page - 1) * limit;

  const articles = await db.article.findMany({
    where: filters,
    take: limit,
    skip,
    orderBy: { createdAt: "desc" },
  });

  // Get total count for pagination
  const totalCount = await db.article.count({ where: filters });

  return {
    data: articles as Article[],
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
}

// Server-side function to fetch a single article by slug
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const article = await db.article.findUnique({
    where: { slug },
  });

  return article as Article | null;
}

// Note: For form submissions and mutations from client components,
// use the client API functions in articles.ts that call the API routes.
// For server components and server actions, use the functions in
// app/actions/article-actions.ts which use the "use server" directive.
