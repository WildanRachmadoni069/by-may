import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/auth";
import { CollectionService } from "@/lib/services/collection-service";

/**
 * GET /api/collections
 *
 * Mengambil semua koleksi
 */
export async function GET() {
  try {
    const collections = await CollectionService.getCollections();
    return NextResponse.json(collections);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { error: "Gagal mengambil koleksi" },
      { status: 500 }
    );
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
        { error: "Nama koleksi harus diisi" },
        { status: 400 }
      );
    }

    const collection = await CollectionService.createCollection(data);
    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { error: "Gagal membuat koleksi" },
      { status: 500 }
    );
  }
}
