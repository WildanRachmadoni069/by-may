import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/auth";
import { CategoryService } from "@/lib/services/category-service";

interface Props {
  params: { id: string };
}

/**
 * GET /api/categories/[id]
 *
 * Mengambil kategori berdasarkan ID
 */
export async function GET(request: Request, { params }: Props) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    const category = await CategoryService.getCategoryById(id);

    if (!category) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Gagal mengambil kategori" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/categories/[id]
 *
 * Memperbarui kategori (admin only)
 */
export async function PATCH(request: Request, { params }: Props) {
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

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    const data = await request.json();

    // Validate input
    if (!data.name || typeof data.name !== "string") {
      return NextResponse.json(
        { error: "Nama kategori harus diisi" },
        { status: 400 }
      );
    }

    const category = await CategoryService.updateCategory(id, data);
    return NextResponse.json(category);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Kategori tidak ditemukan"
    ) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui kategori" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[id]
 *
 * Menghapus kategori (admin only)
 */
export async function DELETE(request: Request, { params }: Props) {
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

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    await CategoryService.deleteCategory(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Kategori tidak ditemukan") {
        return NextResponse.json(
          { error: "Kategori tidak ditemukan" },
          { status: 404 }
        );
      }

      if (error.message.includes("tidak dapat dihapus karena digunakan oleh")) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 400 }
        );
      }
    }

    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus kategori" },
      { status: 500 }
    );
  }
}
