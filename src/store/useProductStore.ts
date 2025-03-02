import { create } from "zustand";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFilteredProducts, // Add this import
} from "@/lib/firebase/products";
import {
  ProductFormValues,
  GetProductsOptions,
  FilteredProductsResponse,
} from "@/types/product";

interface Product extends ProductFormValues {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  selectedProduct: Product | null;
  fetchProducts: () => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  addProduct: (product: ProductFormValues) => Promise<void>;
  editProduct: (
    id: string,
    product: Partial<ProductFormValues>
  ) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  setSelectedProduct: (product: Product | null) => void;
  lastDoc: any;
  hasMore: boolean;
  fetchFilteredProducts: (options: GetProductsOptions) => Promise<void>;
  fetchMoreProducts: (options: GetProductsOptions) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  selectedProduct: null,
  lastDoc: null,
  hasMore: true,

  fetchProducts: async () => {
    set({ loading: true });
    try {
      const productsData = await getProducts();
      set({ products: productsData as Product[], error: null });
    } catch (error) {
      set({ error: "Failed to fetch products" });
      console.error("Error fetching products:", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchProduct: async (id: string) => {
    set({ loading: true });
    try {
      const product = await getProduct(id);
      if (product) {
        set({ selectedProduct: product as Product, error: null });
      } else {
        set({ error: "Product not found" });
      }
    } catch (error) {
      set({ error: "Failed to fetch product" });
      console.error("Error fetching product:", error);
    } finally {
      set({ loading: false });
    }
  },

  addProduct: async (productData: ProductFormValues) => {
    set({ loading: true });
    try {
      const newProduct = await createProduct(productData);
      set((state) => ({
        products: [newProduct as Product, ...state.products],
        error: null,
      }));
    } catch (error) {
      set({ error: "Failed to add product" });
      throw error; // Re-throw for component handling
    } finally {
      set({ loading: false });
    }
  },

  editProduct: async (id: string, productData: Partial<ProductFormValues>) => {
    set({ loading: true });
    try {
      const updatedProduct = await updateProduct(id, productData);
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? ({ ...p, ...updatedProduct } as Product) : p
        ),
        selectedProduct: null,
        error: null,
      }));
    } catch (error) {
      set({ error: "Failed to update product" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  removeProduct: async (id: string) => {
    set({ loading: true });
    try {
      await deleteProduct(id);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        error: null,
      }));
    } catch (error) {
      set({ error: "Failed to delete product" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setSelectedProduct: (product: Product | null) => {
    set({ selectedProduct: product });
  },

  fetchFilteredProducts: async (options: GetProductsOptions) => {
    set({ loading: true, products: [] }); // Reset products when filters change
    try {
      const result = await getFilteredProducts(options);
      set({
        products: result.products as Product[],
        lastDoc: result.lastDoc,
        hasMore: result.hasMore,
        error: null,
      });
    } catch (error) {
      set({ error: "Failed to fetch products" });
      console.error("Error fetching filtered products:", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchMoreProducts: async (options: GetProductsOptions) => {
    const { lastDoc, loading } = get();
    if (loading || !lastDoc) return;

    set({ loading: true });
    try {
      const result = await getFilteredProducts({
        ...options,
        lastDoc,
      });
      set((state) => ({
        products: [...state.products, ...(result.products as Product[])],
        lastDoc: result.lastDoc,
        hasMore: result.hasMore,
        error: null,
      }));
    } catch (error) {
      set({ error: "Failed to fetch more products" });
      console.error("Error fetching more products:", error);
    } finally {
      set({ loading: false });
    }
  },
}));
