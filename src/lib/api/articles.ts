/**
 * API Artikel untuk Client Components
 *
 * File ini berisi fungsi untuk interaksi dengan API artikel
 * dari client components. Untuk operasi server, gunakan article-actions.ts.
 */

// Import tipe data dari types/article.ts
import { ArticleData, ArticleFormData } from "@/types/article";
import { PaginatedResult } from "@/types/common";

// Use the standardized type from common
export type Article = ArticleData;
export type ArticleCreateInput = ArticleFormData;
export type ArticleUpdateInput = Partial<ArticleFormData>;

// Use the standardized PaginatedResult type
export type PaginationResult<T> = PaginatedResult<T>;

/**
 * Mengambil semua artikel dengan filter dan paginasi
 *
 * Digunakan oleh hook SWR useArticles untuk fetching data artikel.
 * Mendukung filter berdasarkan status, pencarian, pengurutan dan paginasi.
 *
 * @param options Opsi filter dan paginasi
 * @param signal AbortSignal untuk membatalkan request
 * @returns Hasil artikel terpaginasi
 */
export async function getArticles(
  options: {
    status?: "draft" | "published";
    page?: number;
    limit?: number;
    search?: string;
    searchQuery?: string; // Alias for search to match other APIs
    sort?: "asc" | "desc";
  } = {},
  signal?: AbortSignal
): Promise<PaginationResult<ArticleData>> {
  const {
    status,
    page = 1,
    limit = 10,
    search,
    searchQuery,
    sort = "desc",
  } = options;

  // Build query parameters
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  // Support both search and searchQuery for consistency
  const searchTerm = searchQuery || search;
  if (searchTerm) params.append("search", searchTerm);

  if (sort) params.append("sort", sort);
  const res = await fetch(`/api/articles?${params.toString()}`, {
    next: { tags: ["articles"] },
    signal, // Support request cancellation
    // Allow SWR to handle caching instead of disabling it completely
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
 * @param signal AbortSignal untuk membatalkan request
 * @returns Artikel yang dibuat
 */
export async function createArticle(
  data: ArticleFormData,
  signal?: AbortSignal
): Promise<ArticleData> {
  const res = await fetch("/api/articles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    signal, // Support request cancellation
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
 * @param signal AbortSignal untuk membatalkan request
 * @returns Artikel yang diperbarui
 */
export async function updateArticle(
  slug: string,
  data: Partial<ArticleFormData>,
  signal?: AbortSignal
): Promise<ArticleData> {
  const res = await fetch(`/api/articles/${slug}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    signal, // Support request cancellation
  });

  if (!res.ok) {
    throw new Error("Gagal memperbarui artikel");
  }

  return res.json();
}

/**
 * Menghapus artikel
 * @param slug Slug artikel yang akan dihapus
 * @param signal AbortSignal untuk membatalkan request
 */
export async function deleteArticle(
  slug: string,
  signal?: AbortSignal
): Promise<void> {
  try {
    // Ambil artikel terlebih dahulu untuk mengekstrak URL gambar featured
    const article = await getArticleBySlug(slug);

    // Hapus artikel dari database
    const res = await fetch(`/api/articles/${slug}`, {
      method: "DELETE",
      signal, // Support request cancellation
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
          signal, // Support request cancellation
        });
      } catch (error) {
        console.error("Gagal menghapus gambar dari Cloudinary:", error);
        // Lanjutkan eksekusi meskipun penghapusan gambar gagal
        // Artikel sudah dihapus dari database
      }
    }
  } catch (error) {
    // Only throw if it's not an AbortError
    if (!(error instanceof DOMException && error.name === "AbortError")) {
      throw error;
    }
  }
}
