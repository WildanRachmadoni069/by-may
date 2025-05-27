/**
 * Store Produk
 *
 * Store ini mengelola state produk untuk digunakan di seluruh aplikasi,
 * terutama untuk state UI seperti filter dan pagination. Untuk fetching data,
 * gunakan hooks useProducts dan useProduct.
 */

import { create } from "zustand";
import { Product, UpdateProductInput } from "@/types/product";
import { PaginationInfo } from "@/types/common";

/**
 * Tipe data untuk filter pencarian produk
 */
interface ProductsFilter {
  /** Kategori produk menggunakan slug */
  categorySlug?: string;
  /** Koleksi produk */
  collectionId?: string;
  /** Metode pengurutan */
  sortBy?: string;
  /** Kata kunci pencarian */
  searchQuery?: string;
  /** Nomor halaman saat ini */
  page?: number;
  /** Jumlah item per halaman */
  limit?: number;
  /** Label khusus */
  specialLabel?: string;
  /** Sertakan varian harga */
  includePriceVariants?: boolean;
}

/**
 * Interface untuk state store produk
 */
interface ProductState {
  /** Status loading */
  loading: boolean;
  /** Pesan error */
  error: string | null;
  /** Filter pencarian aktif */
  filters: ProductsFilter;

  /** Mengatur filter pencarian */
  setFilters: (filters: Partial<ProductsFilter>) => void;
  /** Mengatur ulang filter ke nilai default */
  resetFilters: () => void;
  /** Mengatur status loading */
  setLoading: (isLoading: boolean) => void;
  /** Mengatur pesan error */
  setError: (error: string | null) => void;
}

/**
 * Store Zustand untuk mengelola state UI produk
 */
export const useProductStore = create<ProductState>((set) => ({
  loading: false,
  error: null,
  filters: {
    categorySlug: undefined,
    collectionId: undefined,
    sortBy: "newest",
    searchQuery: "",
    page: 1,
    limit: 10,
    specialLabel: undefined,
    includePriceVariants: true,
  },

  /**
   * Mengatur filter pencarian
   */
  setFilters: (newFilters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
      },
    }));
  },

  /**
   * Mengatur ulang filter ke nilai default
   */
  resetFilters: () => {
    set({
      filters: {
        categorySlug: undefined,
        collectionId: undefined,
        sortBy: "newest",
        searchQuery: "",
        page: 1,
        limit: 10,
        specialLabel: undefined,
        includePriceVariants: true,
      },
    });
  },

  /**
   * Mengatur status loading
   */
  setLoading: (isLoading) => {
    set({ loading: isLoading });
  },

  /**
   * Mengatur pesan error
   */
  setError: (error) => {
    set({ error });
  },
}));
