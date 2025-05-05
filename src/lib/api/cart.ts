import { CartItem, AddToCartInput, UpdateCartItemInput } from "@/types/cart";

/**
 * Mengambil keranjang pengguna saat ini
 * @returns Daftar item dalam keranjang
 */
export async function getCart(): Promise<CartItem[]> {
  const res = await fetch("/api/cart", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Penting untuk menyertakan cookie
  });

  if (!res.ok) {
    if (res.status === 401) {
      return []; // Return empty array for unauthorized users
    }
    throw new Error("Failed to fetch cart");
  }

  return res.json();
}

/**
 * Menambahkan item ke keranjang
 * @param item - Item yang akan ditambahkan ke keranjang
 * @returns Item yang ditambahkan
 */
export async function addToCart(item: AddToCartInput): Promise<CartItem> {
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Penting untuk menyertakan cookie
    body: JSON.stringify(item),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to add item to cart");
  }

  return res.json();
}

/**
 * Mengubah jumlah item di keranjang
 * @param input - Input untuk mengubah jumlah item
 * @returns Item yang diperbarui
 */
export async function updateCartItem(
  input: UpdateCartItemInput
): Promise<CartItem> {
  const res = await fetch(`/api/cart/${input.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Penting untuk menyertakan cookie
    body: JSON.stringify({ quantity: input.quantity }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update item quantity");
  }

  return res.json();
}

/**
 * Menghapus item dari keranjang
 * @param id - ID item yang akan dihapus
 * @returns Status operasi
 */
export async function removeFromCart(
  id: string
): Promise<{ success: boolean }> {
  const res = await fetch(`/api/cart/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Penting untuk menyertakan cookie
  });

  if (!res.ok) {
    throw new Error("Failed to remove item from cart");
  }

  return res.json();
}
