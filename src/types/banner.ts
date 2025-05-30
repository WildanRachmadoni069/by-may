/**
 * Tipe Data untuk Banner
 *
 * File ini berisi definisi tipe data yang digunakan untuk banner
 * di seluruh aplikasi, termasuk data dari API, database, dan form.
 */

/**
 * Data banner dari database atau API
 */
export interface BannerData {
  /** ID unik banner */
  id: string;
  /** Judul banner */
  title: string;
  /** URL gambar dari Cloudinary */
  imageUrl: string;
  /** URL tujuan saat banner diklik (opsional) */
  url: string | null;
  /** Status aktif/nonaktif banner */
  active: boolean;
  /** Tanggal banner dibuat */
  createdAt: string;
  /** Tanggal banner terakhir diperbarui */
  updatedAt: string;
}

/**
 * Input data untuk membuat banner baru
 */
export interface BannerCreateInput {
  /** Judul banner */
  title: string;
  /** URL gambar dari Cloudinary */
  imageUrl: string;
  /** URL tujuan saat banner diklik (opsional) */
  url?: string | null;
  /** Status aktif/nonaktif banner */
  active: boolean;
}

/**
 * Input data untuk mengupdate banner
 */
export interface BannerUpdateInput {
  /** Judul banner */
  title?: string;
  /** URL gambar dari Cloudinary */
  imageUrl?: string;
  /** URL tujuan saat banner diklik (opsional) */
  url?: string | null;
  /** Status aktif/nonaktif banner */
  active?: boolean;
}

/**
 * Data formulir banner untuk komponen UI
 */
export interface BannerFormData {
  /** ID unik banner (saat mengedit) */
  id?: string;
  /** Judul banner */
  title: string;
  /** URL gambar dari Cloudinary */
  imageUrl: string;
  /** URL tujuan saat banner diklik (opsional) */
  url: string;
  /** Status aktif/nonaktif banner */
  active: boolean;
}
