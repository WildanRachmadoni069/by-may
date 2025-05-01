import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/lib/services/product-service";
import { verifyToken } from "@/lib/auth/auth";

/**
 * Mengambil daftar produk dengan filter dan paginasi
 *
 * @param req - Request dari Next.js
 * @returns Response JSON dengan daftar produk terpaginasi atau pesan kesalahan
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const collectionId = searchParams.get("collectionId") || undefined;
    const specialLabel = searchParams.get("specialLabel") || undefined;
    const sortBy = searchParams.get("sortBy") || undefined;

    const result = await ProductService.getProducts({
      page,
      limit,
      search,
      categoryId,
      collectionId,
      specialLabel,
      sortBy,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Gagal mengambil produk:", error);
    return NextResponse.json(
      { error: "Gagal mengambil produk" },
      { status: 500 }
    );
  }
}

/**
 * Membuat produk baru
 *
 * @param req - Request dari Next.js yang berisi data produk baru
 * @returns Response JSON dengan produk yang berhasil dibuat atau pesan kesalahan
 */
export async function POST(req: NextRequest) {
  try {
    // Verifikasi autentikasi (dinonaktifkan untuk pengembangan)
    const token = req.cookies.get("authToken")?.value;

    // Untuk lingkungan produksi, aktifkan kode ini
    /*
    if (!token) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json(
        { error: "Tidak diizinkan: Akses admin diperlukan" },
        { status: 403 }
      );
    }
    */

    const data = await req.json();

    // Buat produk menggunakan layanan
    const product = await ProductService.createProduct(data);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Gagal membuat produk:", error);
    return NextResponse.json(
      {
        error: "Gagal membuat produk",
        details:
          error instanceof Error ? error.message : "Kesalahan tidak diketahui",
      },
      { status: 500 }
    );
  }
}
