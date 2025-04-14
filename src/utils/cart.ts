// SERVER-SIDE ONLY - do not import in client components
import { prisma } from "@/lib/db";
import type { CartItem } from "@/types/cart";

// Get cart items for a user
export async function getCartItems(userId: string): Promise<CartItem[]> {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: true,
    },
  });

  return cartItems.map((item) => ({
    productId: item.productId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image || item.product.mainImage || "",
    variationImage: item.variationImage || undefined,
    selectedOptions: item.selectedOptions as Record<string, string> | undefined,
    variationKey: item.variationKey || undefined,
  }));
}

// Add item to cart
export async function addToCart(
  userId: string,
  item: CartItem
): Promise<CartItem> {
  // Check if item already exists
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      userId,
      productId: item.productId,
      variationKey: item.variationKey || null,
    },
  });

  if (existingItem) {
    // Update quantity if exists
    const updated = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + item.quantity },
      include: { product: true },
    });

    return {
      productId: updated.productId,
      name: updated.name,
      price: updated.price,
      quantity: updated.quantity,
      image: updated.image || updated.product.mainImage || "",
      variationImage: updated.variationImage || undefined,
      selectedOptions: updated.selectedOptions as
        | Record<string, string>
        | undefined,
      variationKey: updated.variationKey || undefined,
    };
  } else {
    // Create new item
    const created = await prisma.cartItem.create({
      data: {
        userId,
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        variationImage: item.variationImage,
        selectedOptions: item.selectedOptions as any,
        variationKey: item.variationKey,
      },
      include: { product: true },
    });

    return {
      productId: created.productId,
      name: created.name,
      price: created.price,
      quantity: created.quantity,
      image: created.image || created.product.mainImage || "",
      variationImage: created.variationImage || undefined,
      selectedOptions: created.selectedOptions as
        | Record<string, string>
        | undefined,
      variationKey: created.variationKey || undefined,
    };
  }
}

// Update cart item quantity
export async function updateCartItemQuantity(
  userId: string,
  productId: string,
  quantity: number,
  variationKey?: string
): Promise<void> {
  await prisma.cartItem.updateMany({
    where: {
      userId,
      productId,
      variationKey: variationKey || null,
    },
    data: { quantity },
  });
}

// Remove cart item
export async function removeFromCart(
  userId: string,
  productId: string,
  variationKey?: string
): Promise<void> {
  await prisma.cartItem.deleteMany({
    where: {
      userId,
      productId,
      variationKey: variationKey || null,
    },
  });
}

// Clear cart
export async function clearCart(userId: string): Promise<void> {
  await prisma.cartItem.deleteMany({
    where: { userId },
  });
}
