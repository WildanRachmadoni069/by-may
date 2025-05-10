import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/auth";
import { CartService } from "@/lib/services/cart-service";

/**
 * PATCH /api/cart/[id]
 * Memperbarui jumlah item dalam keranjang
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const body = await req.json();
    const { quantity } = body;

    // Validasi input
    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Quantity must be at least 1" },
        { status: 400 }
      );
    }

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

    // Update item keranjang
    const updatedCartItem = await CartService.updateCartItem(userId, {
      id,
      quantity,
    });

    return NextResponse.json(updatedCartItem);
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update cart item",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart/[id]
 * Menghapus item dari keranjang
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);

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

    // Hapus item dari keranjang
    await CartService.removeCartItem(userId, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to remove item from cart",
      },
      { status: 500 }
    );
  }
}
