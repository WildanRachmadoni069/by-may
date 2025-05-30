import { NextRequest } from "next/server";
import { BannerService } from "@/lib/services/banner-service";
import { verifyToken } from "@/lib/auth/auth";
import { logError } from "@/lib/debug";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils/api";

/**
 * GET /api/banners
 * Mengambil semua banner
 */
export async function GET() {
  try {
    const result = await BannerService.getBanners();

    if (!result.success) {
      return createErrorResponse(
        result.message || "Gagal mengambil data banner"
      );
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    logError("GET /api/banners", error);
    return createErrorResponse("Gagal mengambil data banner");
  }
}

/**
 * POST /api/banners
 * Membuat banner baru (memerlukan autentikasi admin)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role using JWT
    const token = request.cookies.get("authToken")?.value;
    if (!token) {
      return createErrorResponse(
        "Unauthorized - Silakan login terlebih dahulu",
        401
      );
    }

    const payload = verifyToken(token);
    if (!payload || !payload.id || payload.role !== "admin") {
      return createErrorResponse("Forbidden - Hanya admin yang diizinkan", 403);
    }

    const data = await request.json();

    // Validate required fields
    if (!data.title || typeof data.title !== "string") {
      return createErrorResponse("Judul banner harus diisi", 400);
    }
    if (!data.imageUrl || typeof data.imageUrl !== "string") {
      return createErrorResponse("URL gambar banner harus diisi", 400);
    }
    if (typeof data.active !== "boolean") {
      return createErrorResponse("Status aktif banner harus diisi", 400);
    }
    // URL is optional but must be string if provided
    if (data.url && typeof data.url !== "string") {
      return createErrorResponse("URL tujuan harus berupa string", 400);
    }

    const result = await BannerService.createBanner(data);

    if (!result.success) {
      return createErrorResponse(result.message || "Gagal membuat banner");
    }

    return createSuccessResponse(result.data, result.message);
  } catch (error) {
    logError("POST /api/banners", error);
    return createErrorResponse("Gagal membuat banner");
  }
}
