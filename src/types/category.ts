/**
 * Tipe Data untuk Category
 *
 * File ini berisi definisi tipe data yang digunakan untuk kategori produk
 * di seluruh aplikasi, termasuk data dari API, database, dan form.
 */

/**
 * Data kategori dari database atau API
 */
export interface CategoryData {
  /** ID unik kategori */
  id: string;
  /** Nama kategori */
  name: string;
  /** Tanggal kategori dibuat */
  createdAt: string;
  /** Tanggal kategori terakhir diperbarui */
  updatedAt: string;
}

/**
 * Input data untuk membuat kategori baru
 */
export interface CategoryCreateInput {
  /** Nama kategori */
  name: string;
}

/**
 * Input data untuk mengupdate kategori
 */
export interface CategoryUpdateInput {
  /** Nama kategori */
  name: string;
}
