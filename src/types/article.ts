/**
 * Tipe Data untuk Artikel
 *
 * File ini berisi definisi tipe data yang digunakan untuk artikel
 * di seluruh aplikasi, termasuk data yang diterima dari API, data formulir,
 * dan struktur untuk penyimpanan di database.
 */

/**
 * Data artikel yang berasal dari API atau database
 */
export interface ArticleData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: {
    url: string;
    alt: string;
  } | null;
  status: "draft" | "published";
  meta: {
    title: string;
    description: string;
    og_image: string;
  } | null;
  author: {
    id: string;
    name: string;
  } | null;
  created_at: string | null;
  updated_at: string | null;
  publishedAt?: string | null;
}

/**
 * Data formulir artikel yang digunakan untuk membuat dan mengupdate artikel
 */
export interface ArticleFormData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featured_image?: {
    url: string;
    alt: string;
  } | null;
  status: "draft" | "published";
  meta: {
    title: string;
    description: string;
    og_image?: string;
  };
}
