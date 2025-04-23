import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/lib/services/product-service";
import { verifyToken } from "@/lib/auth/auth";

/**
 * GET /api/products
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "list";

    switch (action) {
      case "list":
        const category = url.searchParams.get("category") || "all";
        const collection = url.searchParams.get("collection") || "all";
        const sortBy = url.searchParams.get("sortBy") || "newest";
        const searchQuery = url.searchParams.get("search") || "";
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "10");

        const result = await ProductService.getProducts({
          category,
          collection,
          sortBy: sortBy as any,
          searchQuery,
          page,
          limit,
        });
        return NextResponse.json(result);

      case "featured":
        const featuredLimit = parseInt(url.searchParams.get("limit") || "8");
        const featuredProducts = await ProductService.getProductsByLabel(
          "featured",
          featuredLimit
        );
        return NextResponse.json(featuredProducts);

      case "new":
        const newLimit = parseInt(url.searchParams.get("limit") || "8");
        const newProducts = await ProductService.getProductsByLabel(
          "new",
          newLimit
        );
        return NextResponse.json(newProducts);

      case "related":
        const productId = url.searchParams.get("productId");
        if (!productId) {
          return NextResponse.json(
            { error: "ID produk diperlukan untuk produk terkait" },
            { status: 400 }
          );
        }
        const categoryId = url.searchParams.get("categoryId") || undefined;
        const collectionId = url.searchParams.get("collectionId") || undefined;
        const relatedLimit = parseInt(url.searchParams.get("limit") || "4");

        const relatedProducts = await ProductService.getRelatedProducts({
          productId,
          categoryId,
          collectionId,
          limit: relatedLimit,
        });

        return NextResponse.json(relatedProducts);

      default:
        return NextResponse.json(
          { error: "Parameter action tidak valid" },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil produk" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Tidak terotorisasi" },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Tidak terotorisasi" },
        { status: 401 }
      );
    }

    const data = await req.json();
    const product = await ProductService.createProduct(data);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: `Gagal membuat produk: ${
          error instanceof Error ? error.message : "Kesalahan tidak diketahui"
        }`,
      },
      { status: 500 }
    );
  }
}
