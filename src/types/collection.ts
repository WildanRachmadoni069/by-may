/**
 * Collection Types
 *
 * Tipe-tipe data untuk fitur koleksi
 */

export interface CollectionData {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CollectionOption {
  id: string;
  name: string;
  value: string; // Biasanya sama dengan ID
  label: string; // Biasanya sama dengan nama
}

export interface CollectionCreateInput {
  name: string;
}

export interface CollectionUpdateInput {
  name: string;
}
