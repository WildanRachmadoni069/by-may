/**
 * Definisi tipe untuk data gambar produk
 */
export interface Image {
  /** URL gambar */
  url: string;
  /** Teks alternatif untuk aksesibilitas */
  alt: string;
}

/**
 * Definisi tipe untuk dimensi produk
 */
export interface Dimensions {
  /** Lebar produk dalam sentimeter */
  width: number;
  /** Panjang produk dalam sentimeter */
  length: number;
  /** Tinggi produk dalam sentimeter */
  height: number;
}

/**
 * Definisi tipe untuk metadata SEO produk
 */
export interface Meta {
  /** Judul untuk SEO */
  title: string;
  /** Deskripsi untuk SEO */
  description: string;
  /** URL gambar untuk Open Graph */
  ogImage?: string;
}

/**
 * Definisi tipe untuk opsi variasi produk
 */
export interface ProductVariationOption {
  /** ID unik opsi variasi */
  id: string;
  /** ID variasi induk */
  variationId: string;
  /** Nama opsi (misalnya: "Merah", "XL") */
  name: string;
  /** URL gambar untuk opsi, opsional */
  imageUrl?: string;
  /** Waktu pembuatan */
  createdAt: Date;
  /** Waktu pembaruan terakhir */
  updatedAt: Date;
}

/**
 * Definisi tipe untuk variasi produk
 */
export interface ProductVariation {
  /** ID unik variasi */
  id: string;
  /** ID produk induk */
  productId: string;
  /** Nama variasi (misalnya: "Warna", "Ukuran") */
  name: string;
  /** Daftar opsi untuk variasi ini */
  options: ProductVariationOption[];
  /** Waktu pembuatan */
  createdAt: Date;
  /** Waktu pembaruan terakhir */
  updatedAt: Date;
}

/**
 * Hubungan antara varian harga dan opsi variasi
 */
export interface PriceVariantToOption {
  /** ID varian harga */
  priceVariantId: string;
  /** ID opsi variasi */
  optionId: string;
  /** Data opsi variasi */
  option: ProductVariationOption;
}

/**
 * Definisi tipe untuk varian harga produk
 */
export interface PriceVariant {
  /** ID unik varian harga */
  id: string;
  /** ID produk induk */
  productId: string;
  /** Harga varian */
  price: number;
  /** Stok varian */
  stock: number;
  /** Kode SKU (Stock Keeping Unit) opsional */
  sku?: string;
  /** Opsi variasi yang terkait dengan varian harga ini */
  options: PriceVariantToOption[];
  /** Waktu pembuatan */
  createdAt: Date;
  /** Waktu pembaruan terakhir */
  updatedAt: Date;
}

/**
 * Definisi tipe utama untuk produk
 */
export interface Product {
  /** ID unik produk */
  id: string;
  /** Nama produk */
  name: string;
  /** Slug produk untuk URL */
  slug: string;
  /** Deskripsi produk dalam HTML */
  description?: string | null;
  /** Gambar utama produk */
  featuredImage?: Image | null;
  /** Gambar tambahan produk */
  additionalImages: Image[];
  /** Harga dasar produk tanpa variasi */
  basePrice?: number | null;
  /** Stok dasar produk tanpa variasi */
  baseStock?: number | null;
  /** Apakah produk memiliki variasi */
  hasVariations: boolean;
  /** Label khusus produk (mis. "new", "best", "sale") */
  specialLabel?: string | null;
  /** Berat produk dalam gram */
  weight?: number | null;
  /** Dimensi produk */
  dimensions?: Dimensions | null;
  /** Metadata SEO */
  meta?: Meta | null;
  /** ID kategori produk */
  categoryId?: string | null;
  /** ID koleksi produk */
  collectionId?: string | null;
  /** Data kategori terkait */
  category?: { id: string; name: string } | null;
  /** Data koleksi terkait */
  collection?: { id: string; name: string } | null;
  /** Variasi produk */
  variations: ProductVariation[];
  /** Varian harga produk */
  priceVariants: PriceVariant[];
  /** Waktu pembuatan */
  createdAt: Date;
  /** Waktu pembaruan terakhir */
  updatedAt: Date;
}

/**
 * Item varian harga untuk penggunaan di state aplikasi
 */
export interface PriceVariantItem {
  /** ID opsional jika sudah ada di database */
  id?: string;
  /** Array ID atau nama opsi yang membentuk kombinasi ini */
  optionCombination: string[];
  /** Label yang dapat dibaca untuk tampilan UI */
  optionLabels: string[];
  /** Harga varian */
  price: number | null;
  /** Stok varian */
  stock: number | null;
  /** Kode SKU varian */
  sku?: string;
}

/**
 * Definisi tipe untuk input pembuatan produk baru
 */
export interface CreateProductInput {
  /** Nama produk */
  name: string;
  /** Slug produk untuk URL */
  slug: string;
  /** Deskripsi produk dalam HTML */
  description?: string | null;
  /** Gambar utama produk */
  featuredImage?: Image | null;
  /** Gambar tambahan produk */
  additionalImages?: Image[] | null;
  /** Harga dasar produk (untuk produk tanpa variasi) */
  basePrice?: number | null;
  /** Stok dasar produk (untuk produk tanpa variasi) */
  baseStock?: number | null;
  /** Apakah produk memiliki variasi */
  hasVariations: boolean;
  /** Label khusus produk */
  specialLabel?: string | null;
  /** Berat produk dalam gram */
  weight?: number | null;
  /** Dimensi produk */
  dimensions?: Dimensions | null;
  /** Metadata SEO */
  meta?: Meta | null;
  /** ID kategori produk */
  categoryId?: string | null;
  /** ID koleksi produk */
  collectionId?: string | null;
  /** Variasi produk untuk produk dengan variasi */
  variations?: Array<{
    /** ID variasi (opsional untuk variasi baru) */
    id?: string;
    /** Nama variasi */
    name: string;
    /** Opsi-opsi untuk variasi ini */
    options: Array<{
      /** ID opsi (opsional untuk opsi baru) */
      id?: string;
      /** Nama opsi */
      name: string;
      /** URL gambar untuk opsi */
      imageUrl?: string;
    }>;
  }>;
  /** Varian harga untuk produk dengan variasi */
  priceVariants?: PriceVariantItem[];
}

/**
 * Definisi tipe untuk input pembaruan produk
 * Menggunakan semua field dari CreateProductInput tapi bersifat opsional
 */
export interface UpdateProductInput extends Partial<CreateProductInput> {}

/**
 * Input untuk membuat variasi produk baru
 */
export interface CreateVariationInput {
  /** ID produk induk */
  productId: string;
  /** Nama variasi */
  name: string;
  /** Opsi-opsi untuk variasi ini */
  options: { name: string; imageUrl?: string }[];
}

/**
 * Input untuk memperbarui variasi produk yang sudah ada
 */
export interface UpdateVariationInput {
  /** ID variasi yang akan diperbarui */
  id: string;
  /** Nama variasi baru (opsional) */
  name?: string;
  /** Opsi-opsi baru (opsional) */
  options?: { id?: string; name: string; imageUrl?: string }[];
}

/**
 * Input untuk membuat varian harga baru
 */
export interface CreatePriceVariantInput {
  /** ID produk induk */
  productId: string;
  /** Harga varian */
  price: number;
  /** Stok varian */
  stock: number;
  /** Kode SKU opsional */
  sku?: string;
  /** ID opsi variasi yang dipilih */
  optionIds: string[];
}

/**
 * Input untuk memperbarui varian harga yang sudah ada
 */
export interface UpdatePriceVariantInput {
  /** ID varian harga yang akan diperbarui */
  id: string;
  /** Harga baru (opsional) */
  price?: number;
  /** Stok baru (opsional) */
  stock?: number;
  /** SKU baru (opsional) */
  sku?: string;
  /** ID opsi baru (opsional) */
  optionIds?: string[];
}
