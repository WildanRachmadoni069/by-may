/**
 * Definisi tipe untuk pengaturan SEO
 */
export interface SEOSetting {
  /** ID unik pengaturan SEO */
  id: string;
  /** ID halaman, unique identifier untuk pengaturan SEO spesifik halaman */
  pageId: string;
  /** Judul halaman untuk SEO */
  title: string;
  /** Deskripsi meta untuk SEO */
  description: string;
  /** Kata kunci untuk SEO (opsional) */
  keywords?: string | null;
  /** URL gambar untuk Open Graph (opsional) */
  ogImage?: string | null;
  /** Waktu pembuatan */
  createdAt: Date;
  /** Waktu pembaruan terakhir */
  updatedAt: Date;
}

/**
 * Definisi tipe untuk hasil query SEO paginated
 */
export interface SEOSettingsResponse {
  seoSettings: SEOSetting[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Input untuk membuat pengaturan SEO baru
 */
export interface CreateSEOSettingInput {
  pageId: string;
  title: string;
  description: string;
  keywords?: string | null;
  ogImage?: string | null;
}

/**
 * Input untuk memperbarui pengaturan SEO yang sudah ada
 */
export interface UpdateSEOSettingInput {
  title?: string;
  description?: string;
  keywords?: string | null;
  ogImage?: string | null;
}

/**
 * Form values untuk halaman pengaturan SEO
 */
export interface SEOFormValues {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
}
