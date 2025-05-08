import { formatRupiah } from "@/lib/utils";

/**
 * Mendapatkan tampilan harga produk yang konsisten
 * - Untuk produk tanpa variasi: menampilkan basePrice
 * - Untuk produk dengan variasi:
 *   - Jika showPriceRange=true: menampilkan rentang harga (min-max) jika berbeda
 *   - Jika showPriceRange=false: menampilkan harga minimal saja
 *
 * @param product - Data produk dengan basePrice atau priceVariants
 * @param showPriceRange - Apakah menampilkan rentang harga (default: true)
 * @returns String format harga yang sesuai
 */
export function getProductPriceDisplay(
  product: any,
  showPriceRange: boolean = true
): string {
  // Untuk produk tanpa variasi, tampilkan basePrice
  if (!product.hasVariations) {
    return product.basePrice ? formatRupiah(product.basePrice) : "-";
  }

  // Untuk produk dengan variasi, periksa priceVariants
  if (
    product.priceVariants &&
    Array.isArray(product.priceVariants) &&
    product.priceVariants.length > 0
  ) {
    // Ambil nilai harga dari setiap varian
    const prices = product.priceVariants
      .map((variant: any) => variant.price)
      .filter(Boolean);

    if (prices.length === 0) {
      return "-"; // Tidak ada harga yang valid
    }

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Jika semua harga sama atau showPriceRange=false, tampilkan satu harga saja
    if (minPrice === maxPrice || !showPriceRange) {
      return formatRupiah(minPrice);
    } else {
      // Tampilkan rentang harga hanya jika min != max
      return `${formatRupiah(minPrice)} - ${formatRupiah(maxPrice)}`;
    }
  }

  // Fallback jika tidak ada informasi harga yang valid
  return "-";
}

/**
 * Menentukan apakah produk memiliki stok tersedia
 * @param product - Data produk dengan informasi stok
 * @returns true jika produk memiliki stok tersedia
 */
export function isProductInStock(product: any): boolean {
  // Handle products without variations (simple products)
  if (!product.hasVariations) {
    // Return true if baseStock is null (unlimited) or greater than 0
    return product.baseStock === null || product.baseStock > 0;
  }

  // For products with variations
  if (product.hasVariations) {
    // If priceVariants array doesn't exist or is empty, we can't determine stock
    if (
      !product.priceVariants ||
      !Array.isArray(product.priceVariants) ||
      product.priceVariants.length === 0
    ) {
      // Fallback to checking baseStock for safety
      return product.baseStock === null || product.baseStock > 0;
    }

    // Check if any variant has stock
    return product.priceVariants.some((variant: any) => {
      // Return true if variant stock is null (unlimited) or greater than 0
      return variant.stock === null || variant.stock > 0;
    });
  }

  // If we can't determine, assume in stock
  return true;
}

/**
 * Mendapatkan total stok produk
 * @param product - Data produk dengan informasi stok
 * @returns Total stok yang tersedia atau null jika tidak ada informasi stok
 */
export function getTotalProductStock(product: any): number | null {
  if (!product.hasVariations && product.baseStock !== null) {
    return product.baseStock;
  }

  if (
    product.hasVariations &&
    product.priceVariants &&
    Array.isArray(product.priceVariants)
  ) {
    // Hitung total stok dari semua varian
    const totalStock = product.priceVariants.reduce(
      (sum: number, variant: any) => sum + (variant.stock || 0),
      0
    );
    return totalStock;
  }

  return null;
}
