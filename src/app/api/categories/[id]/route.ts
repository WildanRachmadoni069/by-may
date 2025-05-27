import { verifyToken } from "@/lib/auth/auth";
import { CategoryService } from "@/lib/services/category-service";
import { logError } from "@/lib/debug";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils/api";

/**
 * GET /api/categories/[id]
 *
 * Mengambil kategori berdasarkan ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await CategoryService.getCategoryById(id);

    if (!category) {
      return createErrorResponse("Kategori tidak ditemukan", 404);
    }

    return createSuccessResponse(category);
  } catch (error) {
    logError("GET /api/categories/[id]", error);
    return createErrorResponse("Gagal mengambil kategori");
  }
}

/**
 * PATCH /api/categories/[id]
 *
 * Memperbarui kategori (admin only)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check auth
    const token = request.headers
      .get("cookie")
      ?.split("authToken=")[1]
      ?.split(";")[0];
    if (!token) {
      return createErrorResponse("Unauthorized", 401);
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return createErrorResponse("Forbidden", 403);
    }

    const { id } = await params;
    const data = await request.json();

    // Validate input
    if (!data.name || typeof data.name !== "string") {
      return createErrorResponse("Nama kategori harus diisi", 400);
    }

    const category = await CategoryService.updateCategory(id, data);
    return createSuccessResponse(category, "Kategori berhasil diperbarui");
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Kategori tidak ditemukan"
    ) {
      return createErrorResponse("Kategori tidak ditemukan", 404);
    }

    logError("PATCH /api/categories/[id]", error);
    return createErrorResponse("Gagal memperbarui kategori");
  }
}

/**
 * DELETE /api/categories/[id]
 *
 * Menghapus kategori (admin only)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check auth
    const token = request.headers
      .get("cookie")
      ?.split("authToken=")[1]
      ?.split(";")[0];
    if (!token) {
      return createErrorResponse("Unauthorized", 401);
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return createErrorResponse("Forbidden", 403);
    }

    const { id } = await params;
    await CategoryService.deleteCategory(id);

    return createSuccessResponse(null, "Kategori berhasil dihapus");
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Kategori tidak ditemukan"
    ) {
      return createErrorResponse("Kategori tidak ditemukan", 404);
    }

    logError("DELETE /api/categories/[id]", error);
    return createErrorResponse("Gagal menghapus kategori");
  }
}
