import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/lib/services/product-service";
import { verifyToken } from "@/lib/auth/auth";

/**
 * GET /api/products/[slug]
 *
 * Mengambil produk berdasarkan slug
 * @param req Request object
 * @param params Slug parameter
 * @returns Product data atau error
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await Promise.resolve(params);

    // Handle ID-based lookup (if the slug matches a UUID pattern)
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let product;

    if (uuidPattern.test(slug)) {
      // If it looks like an ID, try to get by ID
      product = await ProductService.getProductById(slug);
    } else {
      // Otherwise get by slug
      product = await ProductService.getProductBySlug(slug);
    }

    if (!product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(`Error di GET /api/products/${params.slug}:`, error);
    return NextResponse.json(
      { error: "Gagal mengambil produk" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/products/[slug]
 *
 * Memperbarui produk berdasarkan slug
 * @param req Request object
 * @param params Slug parameter
 * @returns Data produk yang diperbarui atau error
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check authentication using your custom auth system
    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Tidak terotorisasi" },
        { status: 401 }
      );
    }

    // Verify the token and check role
    const user = verifyToken(token);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Tidak terotorisasi" },
        { status: 401 }
      );
    }

    const { slug } = await Promise.resolve(params);
    const data = await req.json();

    // Update directly by slug
    const product = await ProductService.updateProductBySlug(slug, data);

    return NextResponse.json(product);
  } catch (error) {
    console.error(`Error di PATCH /api/products/${params.slug}:`, error);
    return NextResponse.json(
      {
        error: `Gagal memperbarui produk: ${
          error instanceof Error ? error.message : "Kesalahan tidak diketahui"
        }`,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[slug]
 *
 * Menghapus produk berdasarkan slug
 * @param req Request object
 * @param params Slug parameter
 * @returns Status keberhasilan atau error
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check authentication using your custom auth system
    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Tidak terotorisasi - Token tidak ada" },
        { status: 401 }
      );
    }

    // Verify the token and check role
    const user = verifyToken(token);

    // Handle null user case
    if (!user) {
      console.error("Verifikasi token gagal - user null");
      return NextResponse.json(
        { error: "Tidak terotorisasi - Token tidak valid" },
        { status: 401 }
      );
    }

    // Check role
    if (user.role !== "admin") {
      console.error(
        `Verifikasi role user gagal - diharapkan admin, didapat ${user.role}`
      );
      return NextResponse.json(
        { error: "Tidak terotorisasi - Hak akses tidak cukup" },
        { status: 403 }
      );
    }

    const { slug } = await Promise.resolve(params);
    if (!slug) {
      return NextResponse.json(
        { error: "Slug produk diperlukan" },
        { status: 400 }
      );
    }
    try {
      // Call the service to delete the product
      const success = await ProductService.deleteProductBySlug(slug);

      if (success) {
        return NextResponse.json({
          success: true,
          message: "Produk dan gambar terkait berhasil dihapus",
        });
      } else {
        return NextResponse.json(
          { error: "Gagal menyelesaikan proses penghapusan" },
          { status: 500 }
        );
      }
    } catch (deleteError) {
      console.error(`Error saat operasi hapus untuk ${slug}:`, deleteError);
      return NextResponse.json(
        {
          error: `Gagal menghapus produk: ${
            deleteError instanceof Error
              ? deleteError.message
              : "Kesalahan tidak diketahui"
          }`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`Error di DELETE /api/products/${params.slug}:`, error);
    return NextResponse.json(
      {
        error: `Gagal memproses permintaan: ${
          error instanceof Error ? error.message : "Kesalahan tidak diketahui"
        }`,
      },
      { status: 500 }
    );
  }
}
