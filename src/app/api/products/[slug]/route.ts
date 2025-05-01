import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/lib/services/product-service";
import { verifyToken } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";

/**
 * Mengambil produk berdasarkan slug
 *
 * @param req - Request dari Next.js
 * @param params - Parameter dinamis dari URL (slug)
 * @returns Response JSON dengan detail produk atau pesan kesalahan
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const product = await ProductService.getProductBySlug(slug);

    if (!product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Gagal mengambil produk:", error);
    return NextResponse.json(
      { error: "Kesalahan server internal" },
      { status: 500 }
    );
  }
}

/**
 * Memperbarui produk berdasarkan slug
 *
 * @param req - Request dari Next.js dengan data pembaruan
 * @param params - Parameter dinamis dari URL (slug)
 * @returns Response JSON dengan produk yang diperbarui atau pesan kesalahan
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Verifikasi autentikasi
    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json(
        { error: "Tidak diizinkan: Akses admin diperlukan" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const slug = params.slug;

    const product = await ProductService.updateProduct(slug, body);

    // Perbarui cache untuk path terkait
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/dashboard/admin/product");

    return NextResponse.json(product);
  } catch (error) {
    console.error("Gagal memperbarui produk:", error);
    return NextResponse.json(
      {
        error: "Gagal memperbarui produk",
        details:
          error instanceof Error ? error.message : "Kesalahan tidak diketahui",
      },
      { status: 500 }
    );
  }
}

/**
 * Menghapus produk berdasarkan slug
 *
 * @param req - Request dari Next.js
 * @param params - Parameter dinamis dari URL (slug)
 * @returns Response JSON dengan status keberhasilan atau pesan kesalahan
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Verifikasi autentikasi
    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json(
        { error: "Tidak diizinkan: Akses admin diperlukan" },
        { status: 403 }
      );
    }

    const slug = params.slug;
    const result = await ProductService.deleteProduct(slug);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || "Gagal menghapus produk" },
        { status: 500 }
      );
    }

    // Perbarui cache untuk path terkait
    revalidatePath("/products");
    revalidatePath("/dashboard/admin/product");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gagal menghapus produk:", error);
    return NextResponse.json(
      {
        error: "Gagal menghapus produk",
        details:
          error instanceof Error ? error.message : "Kesalahan tidak diketahui",
      },
      { status: 500 }
    );
  }
}
