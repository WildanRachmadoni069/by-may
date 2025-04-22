import { create } from "zustand";
import {
  Product,
  ProductCreateInput,
  ProductUpdateInput,
  ProductsFilter,
  ProductsResponse,
} from "@/types/product";
import { PaginationInfo } from "@/types/common";
import {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct as updateProductApi,
  deleteProduct,
} from "@/lib/api/products";

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  filters: ProductsFilter;

  // Actions
  fetchProducts: (options?: ProductsFilter) => Promise<void>;
  fetchProductBySlug: (slug: string) => Promise<Product | null>;
  fetchProductById: (id: string) => Promise<Product | null>;
  fetchProduct: (idOrSlug: string) => Promise<Product | null>;
  setFilters: (filters: Partial<ProductsFilter>) => void;
  resetFilters: () => void;
  addProduct: (product: ProductCreateInput) => Promise<Product>;
  updateProduct: (slug: string, data: ProductUpdateInput) => Promise<Product>;
  removeProduct: (slug: string) => Promise<boolean>;
  setSelectedProduct: (product: Product | null) => void;
}

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

  fetchProducts: async (options = {}) => {
    const { filters } = get();

    // Merge current filters with provided options
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
        error instanceof Error ? error.message : "Failed to fetch products";
      console.error("Error fetching products:", error);
      set({ error: errorMessage, loading: false });
    }
  },

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
        error instanceof Error ? error.message : "Failed to fetch product";
      console.error("Error fetching product by slug:", error);
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  fetchProductById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const product = await getProductById(id);
      if (product) {
        set({ selectedProduct: product });
      }
      set({ loading: false });
      return product;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch product";
      console.error("Error fetching product by ID:", error);
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  fetchProduct: async (idOrSlug: string) => {
    // Check if it's a UUID or a slug
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (uuidPattern.test(idOrSlug)) {
      return get().fetchProductById(idOrSlug);
    } else {
      return get().fetchProductBySlug(idOrSlug);
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

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

  addProduct: async (productData: ProductCreateInput) => {
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
        error instanceof Error ? error.message : "Failed to add product";
      console.error("Error adding product:", error);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * Memperbarui produk yang sudah ada
   */
  updateProduct: async (slug: string, data: ProductUpdateInput) => {
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
        error instanceof Error ? error.message : "Failed to update product";
      console.error("Error updating product:", error);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * Menghapus produk
   */
  removeProduct: async (slug: string) => {
    try {
      const success = await deleteProduct(slug);
      if (success) {
        set((state) => ({
          products: state.products.filter((p) => p.slug !== slug),
          selectedProduct:
            state.selectedProduct?.slug === slug ? null : state.selectedProduct,
        }));
      }
      return success;
    } catch (error) {
      console.error("Error removing product:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove product";
      set({ error: errorMessage });
      throw error;
    }
  },

  setSelectedProduct: (product) => {
    set({ selectedProduct: product });
  },
}));
