"use server";

import { revalidatePath } from "next/cache";
import { CartService } from "@/lib/services/cart-service";
import { CartItem, AddToCartInput, UpdateCartItemInput } from "@/types/cart";

/**
 * Mengambil keranjang pengguna saat ini
 * @param userId - ID pengguna
 * @returns Daftar item dalam keranjang
 */
export async function getCartAction(userId: string): Promise<CartItem[]> {
  if (!userId) {
    return [];
  }

  try {
    return await CartService.getCartItems(userId);
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw new Error("Failed to fetch cart");
  }
}

/**
 * Menambahkan item ke keranjang
 * @param userId - ID pengguna
 * @param input - Data item yang akan ditambahkan
 * @returns Item yang ditambahkan
 */
export async function addToCartAction(
  userId: string,
  input: AddToCartInput
): Promise<CartItem> {
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const cartItem = await CartService.addToCart(userId, input);
    revalidatePath("/keranjang");
    return cartItem;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to add item to cart"
    );
  }
}

/**
 * Mengubah jumlah item di keranjang
 * @param userId - ID pengguna
 * @param input - Data untuk mengubah jumlah
 * @returns Item yang diperbarui
 */
export async function updateCartItemAction(
  userId: string,
  input: UpdateCartItemInput
): Promise<CartItem> {
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const cartItem = await CartService.updateCartItem(userId, input);
    revalidatePath("/keranjang");
    return cartItem;
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update item quantity"
    );
  }
}

/**
 * Menghapus item dari keranjang
 * @param userId - ID pengguna
 * @param id - ID item yang akan dihapus
 * @returns Status keberhasilan
 */
export async function removeFromCartAction(
  userId: string,
  id: string
): Promise<boolean> {
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await CartService.removeCartItem(userId, id);
    revalidatePath("/keranjang");
    return result;
  } catch (error) {
    console.error("Error removing item from cart:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to remove item from cart"
    );
  }
}

/**
 * Mengosongkan keranjang
 * @param userId - ID pengguna
 * @returns Jumlah item yang dihapus
 */
export async function clearCartAction(userId: string): Promise<number> {
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const count = await CartService.clearCart(userId);
    revalidatePath("/keranjang");
    return count;
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to clear cart"
    );
  }
}
