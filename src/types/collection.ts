/**
 * Collection Types
 *
 * Tipe-tipe data untuk fitur koleksi
 */

export interface CollectionData {
  id: string;
  name: string;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CollectionOption {
  id: string;
  name: string;
  slug: string;
  value: string; // Changed to slug for URL-friendly values
  label: string; // Nama untuk ditampilkan
}

export interface CollectionCreateInput {
  name: string;
}

export interface CollectionUpdateInput {
  name: string;
}

export interface CollectionDeleteResponse {
  success: boolean;
  message?: string;
}
