export interface ProductOption {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface ProductVariation {
  id: string;
  name: string;
  options: ProductOption[];
}

export interface ProductDimensions {
  width: number;
  length: number;
  height: number;
}

export interface VariationPrice {
  price: number;
  stock: number;
}

export interface ProductSEO {
  title: string;
  description: string;
  keywords: string[];
}

export interface ProductFormValues {
  id?: string;
  name: string;
  slug: string; // Add slug field if not exists
  description: string;
  category: string;
  specialLabel: string;
  mainImage: string | null;
  additionalImages: (string | null)[];
  hasVariations: boolean;
  basePrice?: number;
  baseStock?: number;
  variations: ProductVariation[];
  variationPrices: Record<string, VariationPrice>;
  weight: number;
  dimensions: ProductDimensions;
  seo: ProductSEO;
  collection?: string; // Make it optional
}
