import { NextRequest } from "next/server";
import { BannerService } from "@/lib/services/banner-service";
import { verifyToken } from "@/lib/auth/auth";
import { logError } from "@/lib/debug";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils/api";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/banners/[id]
 * Mengambil banner berdasarkan ID
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const result = await BannerService.getBannerById(id);

    if (!result.success) {
      return createErrorResponse(
        result.message || "Banner tidak ditemukan",
        404
      );
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    logError("GET /api/banners/[id]", error);
    return createErrorResponse("Gagal mengambil banner");
  }
}

/**
 * PATCH /api/banners/[id]
 * Memperbarui banner berdasarkan ID (memerlukan autentikasi admin)
 */
export async function PATCH(request: NextRequest, { params }: Params) {
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

    const { id } = await params;
    const data = await request.json();
    const result = await BannerService.updateBanner(id, data);

    if (!result.success) {
      return createErrorResponse(result.message || "Gagal memperbarui banner");
    }

    return createSuccessResponse(result.data, result.message);
  } catch (error) {
    logError("PATCH /api/banners/[id]", error);
    return createErrorResponse("Gagal memperbarui banner");
  }
}

/**
 * DELETE /api/banners/[id]
 * Menghapus banner berdasarkan ID (memerlukan autentikasi admin)
 */
export async function DELETE(request: NextRequest, { params }: Params) {
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

    const { id } = await params;
    const result = await BannerService.deleteBanner(id);

    if (!result.success) {
      return createErrorResponse(result.message || "Gagal menghapus banner");
    }

    return createSuccessResponse(null, result.message);
  } catch (error) {
    logError("DELETE /api/banners/[id]", error);
    return createErrorResponse("Gagal menghapus banner");
  }
}
