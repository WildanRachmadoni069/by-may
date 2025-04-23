import { PaginationInfo, PaginatedResult } from "./common";

// Definisi tipe untuk model terkait produk

// Tipe dasar
export type Image = {
  url: string;
  alt: string;
};

export type Dimensions = {
  width: number;
  length: number;
  height: number;
};

export type MetaSEO = {
  title: string;
  description: string;
  ogImage?: string;
  keywords?: string[];
};

// Tipe Variasi Produk
export interface ProductVariationOption {
  id: string;
  name: string;
  imageUrl?: string | null;
}

export interface ProductVariation {
  id: string;
  name: string;
  options: ProductVariationOption[];
}

// Tipe Varian Harga
export interface PriceVariant {
  id?: string;
  price: number;
  stock: number;
  combinationKey: string;
  descriptiveName?: string;
}

// Tipe Produk
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  featuredImage?: Image;
  additionalImages?: Image[];
  basePrice?: number | null;
  baseStock?: number | null;
  hasVariations: boolean;
  specialLabel?: string;
  weight?: number;
  dimensions?: Dimensions;
  meta?: MetaSEO;
  categoryId?: string;
  collectionId?: string;
  variations: ProductVariation[];
  priceVariants: PriceVariant[];
  createdAt: Date;
  updatedAt: Date;
  // Untuk kompatibilitas dengan komponen klien
  mainImage?: string | null;
  variationPrices?: Record<string, { price: number; stock: number }>;
}

// Tipe Nilai Form
export interface ProductFormValues {
  name: string;
  slug: string;
  description: string;
  featuredImage: string | null;
  additionalImages: (string | null)[];
  basePrice?: number;
  baseStock?: number;
  hasVariations: boolean;
  specialLabel: string;
  weight: number;
  dimensions: Dimensions;
  meta: MetaSEO;
  category: string;
  collection?: string;
  variations: ProductVariation[];
  variationPrices: Record<string, { price: number; stock: number }>;
  searchKeywords?: string[];
}

// Tipe filter produk
export type SortBy = "newest" | "price-asc" | "price-desc";

export interface ProductsFilter {
  category?: string;
  collection?: string;
  sortBy?: SortBy;
  searchQuery?: string;
  page?: number;
  limit?: number;
}

// Menggunakan tipe bersama untuk konsistensi
export type ProductsResponse = PaginatedResult<Product>;

// Tipe untuk pembuatan/pembaruan
export interface ProductCreateInput extends Omit<ProductFormValues, ""> {}

export interface ProductUpdateInput extends Partial<ProductCreateInput> {
  id: string;
}
