import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth/auth";

/**
 * GET /api/seo
 *
 * Mendapatkan semua pengaturan SEO
 */
export async function GET() {
  try {
    // Ambil semua pengaturan SEO
    const seoSettings = await db.sEOSetting.findMany({
      orderBy: { pageId: "asc" },
    });

    return NextResponse.json(seoSettings);
  } catch (error: any) {
    console.error("[SEO_GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/seo
 *
 * Membuat pengaturan SEO baru
 */
export async function POST(req: NextRequest) {
  try {
    // Verifikasi autentikasi pengguna
    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Validasi input
    if (!data.pageId || !data.title || !data.description) {
      return NextResponse.json(
        { error: "Missing required fields: pageId, title, description" },
        { status: 400 }
      );
    }

    // Periksa apakah pengaturan SEO untuk halaman ini sudah ada
    const existingSEO = await db.sEOSetting.findUnique({
      where: { pageId: data.pageId },
    });

    if (existingSEO) {
      return NextResponse.json(
        { error: `SEO setting already exists for page: ${data.pageId}` },
        { status: 409 }
      );
    }

    // Buat pengaturan SEO baru
    const seoSetting = await db.sEOSetting.create({
      data: {
        pageId: data.pageId,
        title: data.title,
        description: data.description,
        keywords: data.keywords || null,
        ogImage: data.ogImage || null,
      },
    });

    return NextResponse.json(seoSetting, { status: 201 });
  } catch (error: any) {
    console.error("[SEO_POST]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
