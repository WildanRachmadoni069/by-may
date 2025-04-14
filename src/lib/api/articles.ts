export type ArticleMeta = {
  title: string;
  description: string;
  og_image?: string;
};

export type ArticleAuthor = {
  id: string;
  name: string;
};

export type FeaturedImage = {
  url: string;
  alt: string;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featured_image?: FeaturedImage | null;
  status: "draft" | "published";
  meta?: ArticleMeta | null;
  author?: ArticleAuthor | null;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ArticleCreateInput = Omit<
  Article,
  "id" | "createdAt" | "updatedAt"
>;
export type ArticleUpdateInput = Partial<ArticleCreateInput>;

export type PaginationResult<T> = {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

// Fetch all articles with optional filtering
export async function getArticles(
  options: {
    status?: "draft" | "published";
    page?: number;
    limit?: number;
    search?: string;
    sort?: "asc" | "desc";
  } = {}
): Promise<PaginationResult<Article>> {
  const { status, page = 1, limit = 10, search, sort = "desc" } = options;

  const params = new URLSearchParams();
  if (status) params.append("status", status);
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (search) params.append("search", search);
  if (sort) params.append("sort", sort);

  const res = await fetch(`/api/articles?${params.toString()}`, {
    next: { tags: ["articles"] },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch articles");
  }

  return res.json();
}

// Fetch a single article by slug
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const res = await fetch(`/api/articles/${slug}`, {
    next: { tags: [`article-${slug}`] },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Failed to fetch article");
  }

  return res.json();
}

// Create a new article
export async function createArticle(
  data: ArticleCreateInput
): Promise<Article> {
  const res = await fetch("/api/articles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create article");
  }

  return res.json();
}

// Update an existing article
export async function updateArticle(
  slug: string,
  data: ArticleUpdateInput
): Promise<Article> {
  const res = await fetch(`/api/articles/${slug}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update article");
  }

  return res.json();
}

// Delete an article
export async function deleteArticle(slug: string): Promise<void> {
  // First, get the article to extract featured image URL
  const article = await getArticleBySlug(slug);

  // Delete the article from database
  const res = await fetch(`/api/articles/${slug}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete article");
  }

  // If article had a featured image, delete it from Cloudinary
  if (article && article.featured_image && article.featured_image.url) {
    try {
      await fetch("/api/cloudinary/delete-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: article.featured_image.url }),
      });
    } catch (error) {
      console.error("Failed to delete image from Cloudinary:", error);
      // Continue execution even if image deletion fails
      // The article is already deleted from the database
    }
  }
}
