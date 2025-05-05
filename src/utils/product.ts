import { formatRupiah } from "@/lib/utils";

/**
 * Mendapatkan tampilan harga produk yang konsisten
 * - Untuk produk tanpa variasi: menampilkan basePrice
 * - Untuk produk dengan variasi:
 *   - Jika semua harga sama: menampilkan harga tunggal
 *   - Jika harga bervariasi: menampilkan rentang harga (min-max)
 *
 * @param product - Data produk dengan basePrice atau priceVariants
 * @returns String format harga yang sesuai
 */
export function getProductPriceDisplay(product: any): string {
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

    // Jika semua harga sama, tampilkan satu harga saja
    if (minPrice === maxPrice) {
      return formatRupiah(minPrice);
    } else {
      // Tampilkan rentang harga
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
  if (!product.hasVariations && product.baseStock !== null) {
    return product.baseStock > 0;
  }

  if (
    product.hasVariations &&
    product.priceVariants &&
    Array.isArray(product.priceVariants)
  ) {
    // Produk dianggap ada stok jika minimal ada satu varian yang memiliki stok
    return product.priceVariants.some((variant: any) => variant.stock > 0);
  }

  return false;
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
