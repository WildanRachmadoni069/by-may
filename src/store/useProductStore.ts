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
  categoryId?: string;
  /** Koleksi produk */
  collectionId?: string;
  /** Metode pengurutan */
  sortBy?: string;
  /** Kata kunci pencarian */
  searchQuery?: string;
  /** Nomor halaman saat ini */
  page?: number;
  /** Label khusus */
  specialLabel?: string;
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
  removeProduct: (
    slug: string
  ) => Promise<{ success: boolean; message?: string }>;
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
    categoryId: undefined,
    collectionId: undefined,
    sortBy: "newest",
    searchQuery: "",
    page: 1,
    specialLabel: undefined,
  },

  /**
   * Mengambil daftar produk dengan filter dan paginasi
   */
  fetchProducts: async (options = {}) => {
    const { filters } = get();

    // Log untuk debugging
    console.log("fetchProducts called with options:", options);

    // Pastikan mencampurkan opsi dengan benar
    const mergedOptions = {
      ...filters,
      ...options,
    };

    console.log(
      "Store - Fetching products with merged options:",
      mergedOptions
    );

    set({ loading: true, error: null });
    try {
      // Gunakan searchQuery sebagai search saat memanggil API
      const apiParams = {
        ...mergedOptions,
        search: mergedOptions.searchQuery,
      };
      delete apiParams.searchQuery; // Hapus parameter duplikat

      console.log("API request params:", apiParams);

      const response = await getProducts(apiParams);

      console.log(
        `Received ${response.data.length} products from API, total: ${response.pagination.total}`
      );

      // Update state dengan hasil dan filter yang digunakan
      set({
        products: response.data,
        pagination: response.pagination,
        loading: false,
        filters: { ...get().filters, ...options },
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
    set((state) => {
      // Combine existing filters with new filters
      const updatedFilters = { ...state.filters, ...newFilters };

      console.log("Setting filters:", updatedFilters);

      // Fetch products immediately with new filters
      get().fetchProducts(updatedFilters);

      // Update the filters state
      return { filters: updatedFilters };
    });
  },

  /**
   * Mengatur ulang filter ke nilai default
   */
  resetFilters: () => {
    const defaultFilters = {
      categoryId: undefined,
      collectionId: undefined,
      sortBy: "newest",
      searchQuery: "",
      page: 1,
      specialLabel: undefined,
    };

    set({ filters: defaultFilters });
    get().fetchProducts(defaultFilters);
  },

  /**
   * Menambahkan produk baru
   */
  addProduct: async (productData: CreateProductInput) => {
    set({ loading: true, error: null });
    try {
      const newProduct = await createProduct(productData);

      // Refresh the product list after creating a new product
      get().fetchProducts();

      set({ loading: false });
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

      // Update the product in the list if it exists
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
    set({ loading: true, error: null });
    try {
      const result = await deleteProduct(slug);

      if (result.success) {
        // Refresh the product list with current filters
        await get().fetchProducts(get().filters);

        // If deleted product was selected, clear selection
        if (get().selectedProduct?.slug === slug) {
          set({ selectedProduct: null });
        }
      }

      set({ loading: false });
      return result;
    } catch (error) {
      console.error("Error saat menghapus produk:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menghapus produk";
      set({ error: errorMessage, loading: false });
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Mengatur produk yang dipilih
   */
  setSelectedProduct: (product) => {
    set({ selectedProduct: product });
  },
}));
