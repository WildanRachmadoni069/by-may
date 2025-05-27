import { CartItem, CartSummary } from "@/types/cart";

/**
 * Hitung ringkasan keranjang (total item dan total harga)
 * @param items - Daftar item keranjang
 * @returns Ringkasan keranjang
 */
export const calculateCartSummary = (items: CartItem[]): CartSummary => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalAmount = items.reduce((sum, item) => {
    // Ambil harga dari priceVariant jika produk memiliki variasi, atau dari basePrice
    const price = item.priceVariant?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  return {
    totalItems,
    totalAmount,
  };
};

/**
 * Dapatkan label varian berdasarkan priceVariant
 * Berfungsi untuk menampilkan informasi variasi yang dipilih
 *
 * @param priceVariant - Data varian harga dengan opsi dan variasi
 * @returns String label yang menampilkan kombinasi variasi (contoh: "Warna: Merah, Ukuran: XL")
 */
export const getVariantLabel = (
  priceVariant?: CartItem["priceVariant"]
): string => {
  if (
    !priceVariant ||
    !priceVariant.options ||
    priceVariant.options.length === 0
  ) {
    return "";
  }

  // Kelompokkan opsi berdasarkan variasi
  const optionsByVariation: Record<string, string> = {};

  priceVariant.options.forEach((optionRel) => {
    if (optionRel.option && optionRel.option.variation) {
      const { name: optionName } = optionRel.option;
      const { name: variationName } = optionRel.option.variation;
      optionsByVariation[variationName] = optionName;
    }
  });

  // Format menjadi string "Variasi1: Opsi1, Variasi2: Opsi2"
  return Object.entries(optionsByVariation)
    .map(([variation, option]) => `${variation}: ${option}`)
    .join(", ");
};
