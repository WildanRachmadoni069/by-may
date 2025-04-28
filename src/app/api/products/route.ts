import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/lib/services/product-service";
import { verifyToken } from "@/lib/auth/auth";

// Get products with filtering and pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const collectionId = searchParams.get("collectionId") || undefined;
    const specialLabel = searchParams.get("specialLabel") || undefined;
    const sortBy = searchParams.get("sortBy") || undefined;

    const result = await ProductService.getProducts({
      page,
      limit,
      search,
      categoryId,
      collectionId,
      specialLabel,
      sortBy,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// Create a new product
export async function POST(req: NextRequest) {
  try {
    // Verify authentication - make this more robust
    const token = req.cookies.get("authToken")?.value;

    // For development purposes, allow requests without auth token
    // Remove this in production and uncomment the authentication check
    /*
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }
    */

    const data = await req.json();

    // Create the product
    const product = await ProductService.createProduct(data);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      {
        error: "Failed to create product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
