import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth/auth";

interface Params {
  params: {
    pageId: string;
  };
}

/**
 * GET /api/seo/[pageId]
 *
 * Mendapatkan pengaturan SEO untuk halaman tertentu
 */
export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { pageId } = params;

    if (!pageId) {
      return NextResponse.json(
        { error: "Page ID is required" },
        { status: 400 }
      );
    }

    // Ambil pengaturan SEO berdasarkan pageId
    const seoSetting = await db.sEOSetting.findUnique({
      where: { pageId },
    });

    // Jika tidak ditemukan, kembalikan 404
    if (!seoSetting) {
      return NextResponse.json(
        { error: "SEO setting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(seoSetting);
  } catch (error: any) {
    console.error("[SEO_GET_ID]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/seo/[pageId]
 *
 * Memperbarui pengaturan SEO untuk halaman tertentu
 */
export async function PUT(req: NextRequest, { params }: Params) {
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

    const { pageId } = params;
    const data = await req.json();

    if (!pageId) {
      return NextResponse.json(
        { error: "Page ID is required" },
        { status: 400 }
      );
    }

    // Periksa apakah pengaturan SEO untuk halaman ini ada
    const existingSEO = await db.sEOSetting.findUnique({
      where: { pageId },
    });

    if (!existingSEO) {
      return NextResponse.json(
        { error: `No SEO setting found for page: ${pageId}` },
        { status: 404 }
      );
    }

    // Update pengaturan SEO yang ada
    const updatedSeoSetting = await db.sEOSetting.update({
      where: { pageId },
      data: {
        title: data.title !== undefined ? data.title : existingSEO.title,
        description:
          data.description !== undefined
            ? data.description
            : existingSEO.description,
        keywords:
          data.keywords !== undefined ? data.keywords : existingSEO.keywords,
        ogImage:
          data.ogImage !== undefined ? data.ogImage : existingSEO.ogImage,
      },
    });

    return NextResponse.json(updatedSeoSetting);
  } catch (error: any) {
    console.error("[SEO_PUT]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/seo/[pageId]
 *
 * Menghapus pengaturan SEO untuk halaman tertentu
 */
export async function DELETE(req: NextRequest, { params }: Params) {
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

    const { pageId } = params;

    if (!pageId) {
      return NextResponse.json(
        { error: "Page ID is required" },
        { status: 400 }
      );
    }

    // Periksa apakah pengaturan SEO untuk halaman ini ada
    const existingSEO = await db.sEOSetting.findUnique({
      where: { pageId },
    });

    if (!existingSEO) {
      return NextResponse.json(
        { error: `No SEO setting found for page: ${pageId}` },
        { status: 404 }
      );
    }

    // Hapus pengaturan SEO
    await db.sEOSetting.delete({
      where: { pageId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("[SEO_DELETE]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
