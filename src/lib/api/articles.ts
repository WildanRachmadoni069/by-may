/**
 * API Artikel untuk Client Components
 *
 * File ini berisi tipe data dan fungsi untuk interaksi dengan API artikel
 * dari client components. Untuk operasi server, gunakan article-actions.ts.
 */

// Tipe-tipe data artikel
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

/**
 * Mengambil semua artikel dengan filter opsional
 * @param options Opsi filter dan paginasi
 * @returns Hasil artikel terpaginasi
 */
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
    throw new Error("Gagal mengambil artikel");
  }

  return res.json();
}

/**
 * Mengambil artikel berdasarkan slug
 * @param slug Slug artikel yang dicari
 * @returns Artikel atau null jika tidak ditemukan
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const res = await fetch(`/api/articles/${slug}`, {
    next: { tags: [`article-${slug}`] },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Gagal mengambil artikel");
  }

  return res.json();
}

/**
 * Membuat artikel baru
 * @param data Data artikel yang akan dibuat
 * @returns Artikel yang dibuat
 */
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
    throw new Error("Gagal membuat artikel");
  }

  return res.json();
}

/**
 * Memperbarui artikel yang sudah ada
 * @param slug Slug artikel yang akan diperbarui
 * @param data Data artikel yang diperbarui
 * @returns Artikel yang diperbarui
 */
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
    throw new Error("Gagal memperbarui artikel");
  }

  return res.json();
}

/**
 * Menghapus artikel
 * @param slug Slug artikel yang akan dihapus
 */
export async function deleteArticle(slug: string): Promise<void> {
  // Ambil artikel terlebih dahulu untuk mengekstrak URL gambar featured
  const article = await getArticleBySlug(slug);

  // Hapus artikel dari database
  const res = await fetch(`/api/articles/${slug}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Gagal menghapus artikel");
  }

  // Jika artikel memiliki gambar featured, hapus dari Cloudinary
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
      console.error("Gagal menghapus gambar dari Cloudinary:", error);
      // Lanjutkan eksekusi meskipun penghapusan gambar gagal
      // Artikel sudah dihapus dari database
    }
  }
}
