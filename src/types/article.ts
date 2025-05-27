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
  /** ID unik artikel */
  id: string;
  /** Judul artikel */
  title: string;
  /** URL slug yang ramah SEO */
  slug: string;
  /** Konten artikel dalam format HTML */
  content: string;
  /** Ringkasan singkat artikel (teks polos) */
  excerpt: string | null;
  /** Gambar utama artikel */
  featuredImage: {
    /** URL gambar */
    url: string;
    /** Teks alternatif untuk aksesibilitas dan SEO */
    alt: string;
  } | null;
  /** Status artikel: draft atau published */
  status: "draft" | "published";
  /** Metadata SEO */
  meta: {
    /** Judul untuk SEO dan OpenGraph */
    title: string;
    /** Deskripsi untuk SEO dan OpenGraph */
    description: string;
    /** URL gambar untuk OpenGraph */
    ogImage: string;
  } | null;
  /** Informasi penulis */
  author: {
    /** ID penulis */
    id: string;
    /** Nama penulis */
    name: string;
  } | null;
  /** Tanggal artikel dibuat */
  createdAt: string | null;
  /** Tanggal artikel terakhir diperbarui */
  updatedAt: string | null;
  /** Tanggal artikel dipublikasikan */
  publishedAt?: string | null;
}

/**
 * Data formulir artikel yang digunakan untuk membuat dan mengupdate artikel
 */
export interface ArticleFormData {
  /** Judul artikel */
  title: string;
  /** URL slug yang ramah SEO */
  slug: string;
  /** Konten artikel dalam format HTML */
  content: string;
  /** Ringkasan singkat artikel (teks polos) */
  excerpt?: string | null;
  /** Gambar utama artikel */
  featuredImage?: {
    /** URL gambar */
    url: string;
    /** Teks alternatif untuk aksesibilitas dan SEO */
    alt: string;
  } | null;
  /** Status artikel: draft atau published */
  status: "draft" | "published";
  /** Metadata SEO */
  meta: {
    /** Judul untuk SEO dan OpenGraph */
    title: string;
    /** Deskripsi untuk SEO dan OpenGraph */
    description: string;
    /** URL gambar untuk OpenGraph */
    ogImage?: string;
  };
  /** Informasi penulis */
  author?: {
    /** ID penulis */
    id: string;
    /** Nama penulis */
    name: string;
  } | null;
}
