import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/auth";
import { CollectionService } from "@/lib/services/collection-service";
import { logError } from "@/lib/debug";

/**
 * Format standardized error response
 */
const createErrorResponse = (message: string, status: number = 500) => {
  return NextResponse.json({ message }, { status });
};

/**
 * GET /api/collections/[slug]
 *
 * Mengambil koleksi berdasarkan slug
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const collection = await CollectionService.getCollectionBySlug(slug);

    if (!collection) {
      return createErrorResponse("Koleksi tidak ditemukan", 404);
    }

    return NextResponse.json(collection);
  } catch (error) {
    logError("GET /api/collections/[slug]", error);
    return createErrorResponse("Gagal mengambil koleksi");
  }
}

/**
 * PATCH /api/collections/[slug]
 *
 * Memperbarui koleksi (admin only)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
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

    const { slug } = await params;
    const data = await request.json();

    // Validate input
    if (!data.name || typeof data.name !== "string") {
      return createErrorResponse("Nama koleksi harus diisi", 400);
    }

    const collection = await CollectionService.updateCollection(slug, data);
    return NextResponse.json(collection);
  } catch (error) {
    logError("PATCH /api/collections/[slug]", error);
    if (error instanceof Error && error.message === "Koleksi tidak ditemukan") {
      return createErrorResponse("Koleksi tidak ditemukan", 404);
    }

    return createErrorResponse("Gagal memperbarui koleksi");
  }
}

/**
 * DELETE /api/collections/[slug]
 *
 * Menghapus koleksi (admin only)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
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

    const { slug } = await params;
    const result = await CollectionService.deleteCollection(slug);

    if (!result.success) {
      return createErrorResponse(
        result.message || "Gagal menghapus koleksi",
        result.message?.includes("tidak ditemukan") ? 404 : 400
      );
    }

    return NextResponse.json({ message: "Koleksi berhasil dihapus" });
  } catch (error) {
    logError("DELETE /api/collections/[slug]", error);
    return createErrorResponse("Gagal menghapus koleksi");
  }
}
