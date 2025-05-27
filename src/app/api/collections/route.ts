import { createSuccessResponse, createErrorResponse } from "@/lib/utils/api";
import { verifyToken } from "@/lib/auth/auth";
import { CollectionService } from "@/lib/services/collection-service";
import { logError } from "@/lib/debug";

/**
 * GET /api/collections
 *
 * Mengambil semua koleksi
 */
export async function GET() {
  try {
    const collections = await CollectionService.getCollections();
    return createSuccessResponse(collections);
  } catch (error) {
    logError("GET /api/collections", error);
    return createErrorResponse("Gagal mengambil koleksi");
  }
}

/**
 * POST /api/collections
 *
 * Membuat koleksi baru (admin only)
 */
export async function POST(request: Request) {
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

    const data = await request.json();

    // Validate input
    if (!data.name || typeof data.name !== "string") {
      return createErrorResponse("Nama koleksi harus diisi", 400);
    }

    const collection = await CollectionService.createCollection(data);
    return createSuccessResponse(collection, "Koleksi berhasil dibuat");
  } catch (error) {
    logError("POST /api/collections", error);
    return createErrorResponse("Gagal membuat koleksi");
  }
}
