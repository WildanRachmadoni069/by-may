/**
 * API Artikel untuk Client Components
 *
 * File ini berisi fungsi untuk interaksi dengan API artikel
 * dari client components. Untuk operasi server, gunakan article-actions.ts.
 */

// Import tipe data dari types/article.ts
import { ArticleData, ArticleFormData } from "@/types/article";

// Tipe data untuk API responses
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
): Promise<PaginationResult<ArticleData>> {
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
export async function getArticleBySlug(
  slug: string
): Promise<ArticleData | null> {
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
  data: ArticleFormData
): Promise<ArticleData> {
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
  data: Partial<ArticleFormData>
): Promise<ArticleData> {
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
  if (article && article.featuredImage && article.featuredImage.url) {
    try {
      await fetch("/api/cloudinary/delete-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: article.featuredImage.url }),
      });
    } catch (error) {
      console.error("Gagal menghapus gambar dari Cloudinary:", error);
      // Lanjutkan eksekusi meskipun penghapusan gambar gagal
      // Artikel sudah dihapus dari database
    }
  }
}
