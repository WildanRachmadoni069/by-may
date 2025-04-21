import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/lib/services/product-service";
import { verifyToken } from "@/lib/auth/auth";

/**
 * GET /api/products/[slug]
 *
 * Mengambil produk berdasarkan slug
 * @param req Request object
 * @param params Slug parameter
 * @returns Product data or error
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

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
    console.error(`Error in GET /api/products/${params.slug}:`, error);
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
 * @returns Updated product data or error
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check authentication using your custom auth system
    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the token and check role
    const user = verifyToken(token);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const slug = params.slug;
    const data = await req.json();

    // Handle ID-based update (if the slug matches a UUID pattern)
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let product;

    if (uuidPattern.test(slug)) {
      // If it looks like an ID, update by ID
      product = await ProductService.updateProduct(slug, data);
    } else {
      // First get the product ID from the slug
      const existingProduct = await ProductService.getProductBySlug(slug);
      if (!existingProduct) {
        return NextResponse.json(
          { error: "Produk tidak ditemukan" },
          { status: 404 }
        );
      }

      product = await ProductService.updateProduct(existingProduct.id, data);
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(`Error in PATCH /api/products/${params.slug}:`, error);
    return NextResponse.json(
      {
        error: `Gagal memperbarui produk: ${
          error instanceof Error ? error.message : "Unknown error"
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
 * @returns Success status or error
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check authentication using your custom auth system
    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the token and check role
    const user = verifyToken(token);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const slug = params.slug;

    // Handle ID-based deletion (if the slug matches a UUID pattern)
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let success;

    if (uuidPattern.test(slug)) {
      // If it looks like an ID, delete by ID
      success = await ProductService.deleteProduct(slug);
    } else {
      // First get the product ID from the slug
      const product = await ProductService.getProductBySlug(slug);
      if (!product) {
        return NextResponse.json(
          { error: "Produk tidak ditemukan" },
          { status: 404 }
        );
      }

      success = await ProductService.deleteProduct(product.id);
    }

    return NextResponse.json(success);
  } catch (error) {
    console.error(`Error in DELETE /api/products/${params.slug}:`, error);
    return NextResponse.json(
      {
        error: `Gagal menghapus produk: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
