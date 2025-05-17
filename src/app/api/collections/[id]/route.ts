import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/auth";
import { CollectionService } from "@/lib/services/collection-service";

/**
 * GET /api/collections/[id]
 *
 * Mengambil koleksi berdasarkan ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const collection = await CollectionService.getCollectionById(id);

    if (!collection) {
      return NextResponse.json(
        { error: "Koleksi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Error fetching collection:", error);
    return NextResponse.json(
      { error: "Gagal mengambil koleksi" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/collections/[id]
 *
 * Memperbarui koleksi (admin only)
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();

    // Validate input
    if (!data.name || typeof data.name !== "string") {
      return NextResponse.json(
        { error: "Nama koleksi harus diisi" },
        { status: 400 }
      );
    }

    const collection = await CollectionService.updateCollection(id, data);
    return NextResponse.json(collection);
  } catch (error) {
    if (error instanceof Error && error.message === "Koleksi tidak ditemukan") {
      return NextResponse.json(
        { error: "Koleksi tidak ditemukan" },
        { status: 404 }
      );
    }

    console.error("Error updating collection:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui koleksi" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/collections/[id]
 *
 * Menghapus koleksi (admin only)
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await CollectionService.deleteCollection(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Koleksi tidak ditemukan") {
        return NextResponse.json(
          { error: "Koleksi tidak ditemukan" },
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

    console.error("Error deleting collection:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus koleksi" },
      { status: 500 }
    );
  }
}
