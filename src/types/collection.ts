/**
 * Tipe Data untuk Collection
 *
 * File ini berisi definisi tipe data yang digunakan untuk koleksi produk
 * di seluruh aplikasi, termasuk data dari API, database, dan form.
 */

/**
 * Data koleksi dari database atau API
 */
export interface CollectionData {
  /** ID unik koleksi */
  id: string;
  /** Nama koleksi */
  name: string;
  /** Tanggal koleksi dibuat */
  createdAt: string;
  /** Tanggal koleksi terakhir diperbarui */
  updatedAt: string;
}

/**
 * Input data untuk membuat koleksi baru
 */
export interface CollectionCreateInput {
  /** Nama koleksi */
  name: string;
}

/**
 * Input data untuk mengupdate koleksi
 */
export interface CollectionUpdateInput {
  /** Nama koleksi */
  name: string;
}

/**
 * Koleksi dengan format untuk komponen select
 */
export interface CollectionOption {
  /** ID koleksi (digunakan sebagai value) */
  value: string;
  /** Nama koleksi (digunakan sebagai label) */
  label: string;
  /** ID koleksi */
  id: string;
  /** Nama koleksi */
  name: string;
}
