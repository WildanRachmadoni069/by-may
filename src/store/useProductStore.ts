import { create } from "zustand";
import {
  getFilteredProducts,
  getProduct,
  createProduct,
  updateProduct as updateProductApi,
  deleteProduct,
} from "@/lib/firebase/products";
import {
  Product,
  ProductFormValues,
  GetProductsOptions,
} from "@/types/product";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

interface ProductStore {
  products: Product[];
  selectedProduct: Product | null; // Add selectedProduct to store
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  currentSearchQuery: string; // Add this to track the current search query

  // Fetch filtered products
  fetchFilteredProducts: (options?: GetProductsOptions) => Promise<void>;
  fetchMoreProducts: (options?: GetProductsOptions) => Promise<void>;

  // CRUD operations
  fetchProduct: (id: string) => Promise<Product | null>;
  addProduct: (data: ProductFormValues) => Promise<Product>;
  updateProduct: (
    id: string,
    data: Partial<ProductFormValues>
  ) => Promise<Partial<Product>>;
  removeProduct: (id: string) => Promise<void>;
  clearSelectedProduct: () => void; // Add method to clear selectedProduct
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  selectedProduct: null, // Initialize selectedProduct as null
  lastDoc: null,
  hasMore: false,
  loading: false,
  error: null,
  currentSearchQuery: "", // Initialize with empty string

  // Fetch filtered products (first page)
  fetchFilteredProducts: async (options?: GetProductsOptions) => {
    try {
      set({ loading: true, error: null });

      // Clear currentSearchQuery if searchQuery is explicitly empty string
      const searchQuery =
        options?.searchQuery !== undefined
          ? options.searchQuery
          : get().currentSearchQuery;

      const response = await getFilteredProducts({
        ...options,
        searchQuery,
      });

      set({
        products: response.products,
        lastDoc: response.lastDoc,
        hasMore: response.hasMore,
        loading: false,
        currentSearchQuery: searchQuery, // Update current search query in state
      });
    } catch (error) {
      set({
        loading: false,
        error: `Error fetching products: ${(error as Error).message}`,
      });
    }
  },

  // Fetch more products (pagination)
  fetchMoreProducts: async (options?: GetProductsOptions) => {
    try {
      const { lastDoc, hasMore, products } = get();

      if (!hasMore) return;

      set({ loading: true, error: null });

      // Use provided search query or current one
      const searchQuery =
        options?.searchQuery !== undefined
          ? options.searchQuery
          : get().currentSearchQuery;

      const response = await getFilteredProducts({
        ...options,
        lastDoc,
        searchQuery,
      });

      set({
        products: [...products, ...response.products],
        lastDoc: response.lastDoc,
        hasMore: response.hasMore,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: `Error fetching more products: ${(error as Error).message}`,
      });
    }
  },

  // Fetch a single product
  fetchProduct: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const product = await getProduct(id);

      // Store the fetched product in selectedProduct
      set({
        loading: false,
        selectedProduct: product,
        error: product ? null : "Product not found",
      });

      return product;
    } catch (error) {
      set({
        loading: false,
        selectedProduct: null,
        error: `Error fetching product: ${(error as Error).message}`,
      });
      return null;
    }
  },

  // Add a new product
  addProduct: async (data: ProductFormValues) => {
    try {
      set({ loading: true, error: null });
      const product = await createProduct(data);
      set((state) => ({
        products: [product, ...state.products],
        loading: false,
      }));
      return product;
    } catch (error) {
      set({
        loading: false,
        error: `Error adding product: ${(error as Error).message}`,
      });
      throw error;
    }
  },

  // Update a product
  updateProduct: async (id: string, data: Partial<ProductFormValues>) => {
    try {
      set({ loading: true, error: null });
      const updatedProduct = await updateProductApi(id, data);
      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? { ...product, ...updatedProduct } : product
        ),
        loading: false,
      }));
      return updatedProduct;
    } catch (error) {
      set({
        loading: false,
        error: `Error updating product: ${(error as Error).message}`,
      });
      throw error;
    }
  },

  // Delete a product
  removeProduct: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await deleteProduct(id);
      set((state) => ({
        products: state.products.filter((product) => product.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({
        loading: false,
        error: `Error deleting product: ${(error as Error).message}`,
      });
      throw error;
    }
  },

  // Clear selected product
  clearSelectedProduct: () => {
    set({ selectedProduct: null });
  },
}));
