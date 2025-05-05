import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/auth";
import { CartService } from "@/lib/services/cart-service";

/**
 * GET /api/cart
 * Mengambil keranjang pengguna yang sedang login
 */
export async function GET(req: NextRequest) {
  try {
    // Dapatkan token dari cookie
    const token = req.cookies.get("authToken")?.value;

    // Periksa apakah pengguna sudah login
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verifikasi token
    const session = verifyToken(token);
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;

    // Ambil item keranjang pengguna
    const cartItems = await CartService.getCartItems(userId);

    return NextResponse.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart
 * Menambahkan item ke keranjang
 */
export async function POST(req: NextRequest) {
  try {
    // Dapatkan token dari cookie
    const token = req.cookies.get("authToken")?.value;

    // Periksa apakah pengguna sudah login
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verifikasi token
    const session = verifyToken(token);
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;
    const body = await req.json();

    // Validasi input
    const { productId, priceVariantId, quantity } = body;

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    // Tambahkan ke keranjang
    const cartItem = await CartService.addToCart(userId, {
      productId,
      priceVariantId,
      quantity,
    });

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to add item to cart",
      },
      { status: 500 }
    );
  }
}
