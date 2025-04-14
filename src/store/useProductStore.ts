import { create } from "zustand";
import {
  getProducts,
  getProductBySlug,
  getFilteredProducts,
  addProduct,
  updateProduct,
} from "@/utils/product";
import type {
  Product,
  ProductFormValues,
  GetProductsOptions,
  FilteredProductsResponse,
} from "@/types/product";

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
  lastDoc: any | null;
  hasMore: boolean;

  // Actions
  fetchProducts: () => Promise<Product[]>;
  fetchProductBySlug: (slug: string) => Promise<Product | null>;
  fetchFilteredProducts: (
    options: GetProductsOptions
  ) => Promise<FilteredProductsResponse>;
  addProduct: (product: ProductFormValues) => Promise<Product>;
  updateProduct: (id: string, product: ProductFormValues) => Promise<Product>;
  setSelectedProduct: (product: Product | null) => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
  lastDoc: null,
  hasMore: true,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await getProducts();
      set({ products, loading: false });
      return products;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch products";
      console.error("Error fetching products:", error);
      set({ error: errorMessage, loading: false });
      return [];
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

  fetchFilteredProducts: async (options: GetProductsOptions) => {
    set({ loading: true, error: null });
    try {
      const response = await getFilteredProducts(options);
      set({
        products: response.products,
        lastDoc: response.lastDoc,
        hasMore: response.hasMore,
        loading: false,
      });
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch filtered products";
      console.error("Error fetching filtered products:", error);
      set({ error: errorMessage, loading: false });
      return { products: [], lastDoc: null, hasMore: false };
    }
  },

  addProduct: async (productData: ProductFormValues) => {
    set({ loading: true, error: null });
    try {
      const newProduct = await addProduct(productData);
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

  updateProduct: async (id: string, productData: ProductFormValues) => {
    set({ loading: true, error: null });
    try {
      const updatedProduct = await updateProduct(id, productData);
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updatedProduct : p)),
        selectedProduct:
          state.selectedProduct?.id === id
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

  setSelectedProduct: (product) => {
    set({ selectedProduct: product });
  },
}));
