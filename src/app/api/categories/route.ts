import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/auth";
import { CategoryService } from "@/lib/services/category-service";

/**
 * GET /api/categories
 *
 * Mengambil semua kategori
 */
export async function GET() {
  try {
    const categories = await CategoryService.getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Gagal mengambil kategori" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 *
 * Membuat kategori baru (admin only)
 */
export async function POST(request: Request) {
  try {
    // Check auth
    const token = request.headers
      .get("cookie")
      ?.split("authToken=")[1]
      ?.split(";")[0];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();

    // Validate input
    if (!data.name || typeof data.name !== "string") {
      return NextResponse.json(
        { error: "Nama kategori harus diisi" },
        { status: 400 }
      );
    }

    const category = await CategoryService.createCategory(data);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Gagal membuat kategori" },
      { status: 500 }
    );
  }
}
