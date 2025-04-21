import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/lib/services/product-service";
import { verifyToken } from "@/lib/auth/auth";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "list";

    switch (action) {
      case "list":
        // Extract filter params for regular product listing
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
            { error: "Product ID is required for related products" },
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
          { error: "Invalid action parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in GET /api/products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const data = await req.json();
    const product = await ProductService.createProduct(data);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/products:", error);
    return NextResponse.json(
      {
        error: `Failed to create product: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
