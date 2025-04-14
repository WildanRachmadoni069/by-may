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
    tag?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<PaginationResult<Article>> {
  const { status, tag, page = 1, limit = 10 } = options;

  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (tag) params.append("tag", tag);
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const res = await fetch(`/api/articles?${params.toString()}`);

  if (!res.ok) {
    throw new Error("Failed to fetch articles");
  }

  return res.json();
}

// Fetch a single article by slug
export async function getArticleBySlug(slug: string): Promise<Article> {
  const res = await fetch(`/api/articles/${slug}`);

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
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to create article");
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
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to update article");
  }

  return res.json();
}

// Delete an article
export async function deleteArticle(slug: string): Promise<void> {
  const res = await fetch(`/api/articles/${slug}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to delete article");
  }
}
