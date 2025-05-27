import { verifyToken } from "@/lib/auth/auth";
import { CategoryService } from "@/lib/services/category-service";
import { logError } from "@/lib/debug";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils/api";

/**
 * GET /api/categories
 *
 * Mengambil semua kategori
 */
export async function GET() {
  try {
    const response = await CategoryService.getCategories();
    if (!response.success) {
      return createErrorResponse(
        response.message || "Gagal mengambil daftar kategori",
        400
      );
    }
    return createSuccessResponse(response.data);
  } catch (error) {
    logError("GET /api/categories", error);
    return createErrorResponse("Gagal mengambil daftar kategori", 500);
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
      return createErrorResponse(
        "Unauthorized - Silakan login terlebih dahulu",
        401
      );
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return createErrorResponse("Forbidden - Hanya admin yang diizinkan", 403);
    }

    const data = await request.json();

    // Validate input
    if (!data.name || typeof data.name !== "string") {
      return createErrorResponse("Nama kategori harus diisi", 400);
    }

    const response = await CategoryService.createCategory(data);
    if (!response.success) {
      return createErrorResponse(
        response.message || "Gagal membuat kategori",
        400
      );
    }

    return createSuccessResponse(response.data, "Kategori berhasil dibuat");
  } catch (error) {
    logError("POST /api/categories", error);
    return createErrorResponse("Gagal membuat kategori", 500);
  }
}
