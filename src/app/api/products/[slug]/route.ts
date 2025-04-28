import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/lib/services/product-service";
import { verifyToken } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";

// Get a single product by slug
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const product = await ProductService.getProductBySlug(slug);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update a product
export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Verify authentication
    const token = req.cookies.get("authToken")?.value;
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

    const body = await req.json();
    const slug = params.slug;

    const product = await ProductService.updateProduct(slug, body);

    // Revalidate paths
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/dashboard/admin/product");

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      {
        error: "Failed to update product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Delete a product
export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Verify authentication
    const token = req.cookies.get("authToken")?.value;
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

    const slug = params.slug;
    const result = await ProductService.deleteProduct(slug);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || "Failed to delete product" },
        { status: 500 }
      );
    }

    // Revalidate paths
    revalidatePath("/products");
    revalidatePath("/dashboard/admin/product");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      {
        error: "Failed to delete product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
