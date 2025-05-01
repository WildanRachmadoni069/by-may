/**
 * Store Produk
 *
 * Store ini mengelola state produk untuk digunakan di seluruh aplikasi,
 * termasuk daftar produk, filter, paginasi, dan operasi CRUD.
 */

import { create } from "zustand";
import {
  Product,
  CreateProductInput,
  UpdateProductInput,
} from "@/types/product";
import { PaginationInfo } from "@/types/common";
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct as updateProductApi,
  deleteProduct,
} from "@/lib/api/products";

/**
 * Tipe data untuk filter pencarian produk
 */
interface ProductsFilter {
  /** Kategori produk */
  category: string;
  /** Koleksi produk */
  collection: string;
  /** Metode pengurutan */
  sortBy: string;
  /** Kata kunci pencarian */
  searchQuery: string;
  /** Nomor halaman saat ini */
  page?: number;
}

/**
 * Interface untuk state store produk
 */
interface ProductState {
  /** Daftar produk saat ini */
  products: Product[];
  /** Produk yang sedang dipilih */
  selectedProduct: Product | null;
  /** Status loading */
  loading: boolean;
  /** Pesan error */
  error: string | null;
  /** Informasi paginasi */
  pagination: PaginationInfo;
  /** Filter pencarian */
  filters: ProductsFilter;

  /** Mengambil daftar produk dengan filter */
  fetchProducts: (options?: Partial<ProductsFilter>) => Promise<void>;
  /** Mengambil produk berdasarkan slug */
  fetchProductBySlug: (slug: string) => Promise<Product | null>;
  /** Mengatur filter pencarian */
  setFilters: (filters: Partial<ProductsFilter>) => void;
  /** Mengatur ulang filter ke nilai default */
  resetFilters: () => void;
  /** Menambahkan produk baru */
  addProduct: (product: CreateProductInput) => Promise<Product>;
  /** Memperbarui produk yang ada */
  updateProduct: (slug: string, data: UpdateProductInput) => Promise<Product>;
  /** Menghapus produk */
  removeProduct: (slug: string) => Promise<boolean>;
  /** Mengatur produk yang dipilih */
  setSelectedProduct: (product: Product | null) => void;
}

/**
 * Store Zustand untuk mengelola produk
 */
export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    category: "all",
    collection: "all",
    sortBy: "newest",
    searchQuery: "",
  },

  /**
   * Mengambil daftar produk dengan filter dan paginasi
   */
  fetchProducts: async (options = {}) => {
    const { filters } = get();
    const mergedOptions = { ...filters, ...options };

    set({ loading: true, error: null });
    try {
      const response = await getProducts(mergedOptions);
      set({
        products: response.data,
        pagination: response.pagination,
        loading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal mengambil produk";
      console.error("Error saat mengambil produk:", error);
      set({ error: errorMessage, loading: false });
    }
  },

  /**
   * Mengambil produk berdasarkan slug
   */
  fetchProductBySlug: async (slug: string) => {
    set({ loading: true, error: null });
    try {
      const product = await getProductBySlug(slug);
      if (product) {
        set({ selectedProduct: product });
      }
      set({ loading: false });
      return product;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal mengambil produk";
      console.error("Error saat mengambil produk berdasarkan slug:", error);
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  /**
   * Mengatur filter pencarian
   */
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  /**
   * Mengatur ulang filter ke nilai default
   */
  resetFilters: () => {
    set({
      filters: {
        category: "all",
        collection: "all",
        sortBy: "newest",
        searchQuery: "",
        page: 1,
      },
    });
  },

  /**
   * Menambahkan produk baru
   */
  addProduct: async (productData: CreateProductInput) => {
    set({ loading: true, error: null });
    try {
      const newProduct = await createProduct(productData);
      set((state) => ({
        products: [newProduct, ...state.products],
        loading: false,
      }));
      return newProduct;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menambahkan produk";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * Memperbarui produk yang ada
   */
  updateProduct: async (slug: string, data: UpdateProductInput) => {
    set({ loading: true, error: null });
    try {
      const updatedProduct = await updateProductApi(slug, data);
      set((state) => ({
        products: state.products.map((p) =>
          p.slug === slug ? updatedProduct : p
        ),
        selectedProduct:
          state.selectedProduct?.slug === slug
            ? updatedProduct
            : state.selectedProduct,
        loading: false,
      }));
      return updatedProduct;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal memperbarui produk";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * Menghapus produk
   */
  removeProduct: async (slug: string) => {
    try {
      const result = await deleteProduct(slug);

      if (result.success) {
        set((state) => ({
          products: state.products.filter((p) => p.slug !== slug),
          selectedProduct:
            state.selectedProduct?.slug === slug ? null : state.selectedProduct,
        }));
        return true;
      }

      throw new Error(result.message || "Gagal menghapus produk");
    } catch (error) {
      console.error("Error saat menghapus produk:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menghapus produk";
      set({ error: errorMessage });
      throw error;
    }
  },

  /**
   * Mengatur produk yang dipilih
   */
  setSelectedProduct: (product) => {
    set({ selectedProduct: product });
  },
}));
