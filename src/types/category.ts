/**
 * Category Types
 *
 * Tipe-tipe data untuk fitur kategori
 */

export interface CategoryData {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryOption {
  id: string;
  name: string;
  value: string; // Biasanya sama dengan ID
  label: string; // Biasanya sama dengan nama
}

export interface CategoryCreateInput {
  name: string;
}

export interface CategoryUpdateInput {
  name: string;
}
