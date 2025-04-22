import { PaginationInfo, PaginatedResult } from "./common";

// Type definitions for product-related models

// Base types
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

// Product Variation Types
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

// Price Variant Types
export interface PriceVariant {
  id?: string;
  price: number;
  stock: number;
  combinationKey: string;
  descriptiveName?: string;
}

// Product Types
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
  // For client-side compatibility
  mainImage?: string | null;
  variationPrices?: Record<string, { price: number; stock: number }>;
}

// Form Values Type
export interface ProductFormValues {
  name: string;
  slug: string;
  description: string;
  featuredImage: string | null; // Changed from mainImage to featuredImage
  additionalImages: (string | null)[];
  basePrice?: number;
  baseStock?: number;
  hasVariations: boolean;
  specialLabel: string;
  weight: number;
  dimensions: Dimensions;
  meta: MetaSEO; // Changed from seo to meta
  category: string;
  collection?: string;
  variations: ProductVariation[];
  variationPrices: Record<string, { price: number; stock: number }>;
  searchKeywords?: string[];
}

// Product filtering types
export type SortBy = "newest" | "price-asc" | "price-desc";

export interface ProductsFilter {
  category?: string;
  collection?: string;
  sortBy?: SortBy;
  searchQuery?: string;
  page?: number;
  limit?: number;
}

// Use the shared types for consistency
export type ProductsResponse = PaginatedResult<Product>;

// Create/Update types
export interface ProductCreateInput extends Omit<ProductFormValues, ""> {
  // Removed the "seo" omit since we're now using meta directly
}

export interface ProductUpdateInput extends Partial<ProductCreateInput> {
  id: string;
}
