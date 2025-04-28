export interface Image {
  url: string;
  alt: string;
}

export interface Dimensions {
  width: number;
  length: number;
  height: number;
}

export interface Meta {
  title: string;
  description: string;
  ogImage?: string;
}

export interface ProductVariationOption {
  id: string;
  variationId: string;
  name: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariation {
  id: string;
  productId: string;
  name: string;
  options: ProductVariationOption[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceVariantToOption {
  priceVariantId: string;
  optionId: string;
  option: ProductVariationOption;
}

export interface PriceVariant {
  id: string;
  productId: string;
  price: number;
  stock: number;
  sku?: string;
  options: PriceVariantToOption[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  featuredImage?: Image | null;
  additionalImages: Image[];
  basePrice?: number | null;
  baseStock?: number | null;
  hasVariations: boolean;
  specialLabel?: string | null;
  weight?: number | null;
  dimensions?: Dimensions | null;
  meta?: Meta | null;
  categoryId?: string | null;
  collectionId?: string | null;
  category?: { id: string; name: string } | null;
  collection?: { id: string; name: string } | null;
  variations: ProductVariation[];
  priceVariants: PriceVariant[];
  createdAt: Date;
  updatedAt: Date;
}

// For internal use (price variants in variation store)
export interface PriceVariantItem {
  id?: string;
  optionCombination: string[]; // Array of option IDs or names that make up this combination
  optionLabels: string[]; // Human-readable labels for display
  price: number | null;
  stock: number | null;
  sku?: string;
}

// Form submission types
export interface CreateProductInput {
  name: string;
  slug: string;
  description?: string | null;
  featuredImage?: Image | null;
  additionalImages?: Image[] | null;
  basePrice?: number | null;
  baseStock?: number | null;
  hasVariations: boolean;
  specialLabel?: string | null;
  weight?: number | null;
  dimensions?: Dimensions | null;
  meta?: Meta | null;
  categoryId?: string | null;
  collectionId?: string | null;
  variations?: Array<{
    id?: string;
    name: string;
    options: Array<{
      id?: string;
      name: string;
      imageUrl?: string;
    }>;
  }>;
  priceVariants?: PriceVariantItem[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

// Types for product variation management
export interface CreateVariationInput {
  productId: string;
  name: string;
  options: { name: string; imageUrl?: string }[];
}

export interface UpdateVariationInput {
  id: string;
  name?: string;
  options?: { id?: string; name: string; imageUrl?: string }[];
}

export interface CreatePriceVariantInput {
  productId: string;
  price: number;
  stock: number;
  sku?: string;
  optionIds: string[]; // IDs of the selected options
}

export interface UpdatePriceVariantInput {
  id: string;
  price?: number;
  stock?: number;
  sku?: string;
  optionIds?: string[];
}
