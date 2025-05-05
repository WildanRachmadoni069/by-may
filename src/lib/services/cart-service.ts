import { db } from "@/lib/db";
import { CartItem, AddToCartInput, UpdateCartItemInput } from "@/types/cart";

/**
 * Layanan Cart
 *
 * Bertanggung jawab untuk semua operasi keranjang pada database
 */
export const CartService = {
  /**
   * Mengambil item keranjang pengguna
   * @param userId - ID pengguna
   * @returns Daftar item dalam keranjang pengguna
   */
  async getCartItems(userId: string): Promise<CartItem[]> {
    const cartItems = await db.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            featuredImage: true,
          },
        },
        priceVariant: {
          include: {
            options: {
              include: {
                option: {
                  include: {
                    variation: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return cartItems.map((item) => ({
      id: item.id,
      userId: item.userId,
      productId: item.productId,
      priceVariantId: item.priceVariantId || undefined,
      quantity: item.quantity,
      product: item.product
        ? {
            name: item.product.name,
            slug: item.product.slug,
            featuredImage: item.product.featuredImage as any,
          }
        : undefined,
      priceVariant: item.priceVariant
        ? {
            price: item.priceVariant.price,
            stock: item.priceVariant.stock,
            options: item.priceVariant.options.map((o) => ({
              option: {
                id: o.option.id,
                name: o.option.name,
                imageUrl: o.option.imageUrl || undefined,
                variation: {
                  id: o.option.variation.id,
                  name: o.option.variation.name,
                },
              },
            })),
          }
        : undefined,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  },

  /**
   * Menambahkan item ke keranjang
   * @param userId - ID pengguna
   * @param input - Data item yang akan ditambahkan
   * @returns Item keranjang yang ditambahkan
   */
  async addToCart(userId: string, input: AddToCartInput): Promise<CartItem> {
    const { productId, priceVariantId, quantity } = input;

    // Validasi produk
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Produk tidak ditemukan");
    }

    // Validasi priceVariant jika ada
    if (product.hasVariations && !priceVariantId) {
      throw new Error("Produk dengan variasi membutuhkan priceVariantId");
    }

    // Validasi stok
    if (product.hasVariations && priceVariantId) {
      const priceVariant = await db.priceVariant.findUnique({
        where: { id: priceVariantId },
      });

      if (!priceVariant) {
        throw new Error("Varian harga tidak ditemukan");
      }

      if (priceVariant.stock < quantity) {
        throw new Error(`Hanya tersedia ${priceVariant.stock} item`);
      }
    } else if (!product.hasVariations && (product.baseStock ?? 0) < quantity) {
      throw new Error(`Hanya tersedia ${product.baseStock} item`);
    }

    // Cek apakah item sudah ada di keranjang
    const existingCartItem = await db.cartItem.findFirst({
      where: {
        userId,
        productId,
        priceVariantId: priceVariantId || null,
      },
    });

    let cartItem;

    if (existingCartItem) {
      // Update jumlah jika item sudah ada
      cartItem = await db.cartItem.update({
        where: {
          id: existingCartItem.id,
        },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              featuredImage: true,
            },
          },
          priceVariant: {
            include: {
              options: {
                include: {
                  option: {
                    include: {
                      variation: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    } else {
      // Tambahkan item baru ke keranjang
      cartItem = await db.cartItem.create({
        data: {
          userId,
          productId,
          priceVariantId: priceVariantId || null,
          quantity,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              featuredImage: true,
            },
          },
          priceVariant: {
            include: {
              options: {
                include: {
                  option: {
                    include: {
                      variation: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    return {
      id: cartItem.id,
      userId: cartItem.userId,
      productId: cartItem.productId,
      priceVariantId: cartItem.priceVariantId || undefined,
      quantity: cartItem.quantity,
      product: cartItem.product
        ? {
            name: cartItem.product.name,
            slug: cartItem.product.slug,
            featuredImage: cartItem.product.featuredImage as any,
          }
        : undefined,
      priceVariant: cartItem.priceVariant
        ? {
            price: cartItem.priceVariant.price,
            stock: cartItem.priceVariant.stock,
            options: cartItem.priceVariant.options.map((o) => ({
              option: {
                id: o.option.id,
                name: o.option.name,
                imageUrl: o.option.imageUrl || undefined,
                variation: {
                  id: o.option.variation.id,
                  name: o.option.variation.name,
                },
              },
            })),
          }
        : undefined,
      createdAt: cartItem.createdAt,
      updatedAt: cartItem.updatedAt,
    };
  },

  /**
   * Memperbarui jumlah item di keranjang
   * @param userId - ID pengguna
   * @param input - Data item yang akan diperbarui
   * @returns Item keranjang yang diperbarui
   */
  async updateCartItem(
    userId: string,
    input: UpdateCartItemInput
  ): Promise<CartItem> {
    const { id, quantity } = input;

    // Validasi item keranjang
    const cartItem = await db.cartItem.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        product: true,
        priceVariant: true,
      },
    });

    if (!cartItem) {
      throw new Error("Item keranjang tidak ditemukan");
    }

    // Validasi stok
    if (cartItem.product.hasVariations && cartItem.priceVariant) {
      if (cartItem.priceVariant.stock < quantity) {
        throw new Error(`Hanya tersedia ${cartItem.priceVariant.stock} item`);
      }
    } else if (
      !cartItem.product.hasVariations &&
      (cartItem.product.baseStock ?? 0) < quantity
    ) {
      throw new Error(`Hanya tersedia ${cartItem.product.baseStock} item`);
    }

    // Update jumlah item
    const updatedCartItem = await db.cartItem.update({
      where: {
        id,
      },
      data: {
        quantity,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            featuredImage: true,
          },
        },
        priceVariant: {
          include: {
            options: {
              include: {
                option: {
                  include: {
                    variation: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      id: updatedCartItem.id,
      userId: updatedCartItem.userId,
      productId: updatedCartItem.productId,
      priceVariantId: updatedCartItem.priceVariantId || undefined,
      quantity: updatedCartItem.quantity,
      product: updatedCartItem.product
        ? {
            name: updatedCartItem.product.name,
            slug: updatedCartItem.product.slug,
            featuredImage: updatedCartItem.product.featuredImage as any,
          }
        : undefined,
      priceVariant: updatedCartItem.priceVariant
        ? {
            price: updatedCartItem.priceVariant.price,
            stock: updatedCartItem.priceVariant.stock,
            options: updatedCartItem.priceVariant.options.map((o) => ({
              option: {
                id: o.option.id,
                name: o.option.name,
                imageUrl: o.option.imageUrl || undefined,
                variation: {
                  id: o.option.variation.id,
                  name: o.option.variation.name,
                },
              },
            })),
          }
        : undefined,
      createdAt: updatedCartItem.createdAt,
      updatedAt: updatedCartItem.updatedAt,
    };
  },

  /**
   * Menghapus item dari keranjang
   * @param userId - ID pengguna
   * @param id - ID item keranjang
   * @returns Status keberhasilan
   */
  async removeCartItem(userId: string, id: string): Promise<boolean> {
    // Validasi item keranjang
    const cartItem = await db.cartItem.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!cartItem) {
      throw new Error("Item keranjang tidak ditemukan");
    }

    // Hapus item dari keranjang
    await db.cartItem.delete({
      where: {
        id,
      },
    });

    return true;
  },

  /**
   * Menghapus semua item dari keranjang pengguna
   * @param userId - ID pengguna
   * @returns Jumlah item yang dihapus
   */
  async clearCart(userId: string): Promise<number> {
    const result = await db.cartItem.deleteMany({
      where: {
        userId,
      },
    });

    return result.count;
  },
};
