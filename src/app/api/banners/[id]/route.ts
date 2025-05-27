import { NextRequest, NextResponse } from "next/server";
import { BannerService } from "@/lib/services/banner-service";
import { verifyToken } from "@/lib/auth/auth";

/**
 * GET /api/banners/[id]
 * Mengambil banner berdasarkan ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const banner = await BannerService.getBannerById(id);

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error("Error fetching banner:", error);
    return NextResponse.json(
      { error: "Failed to fetch banner" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/banners/[id]
 * Memperbarui banner berdasarkan ID (memerlukan autentikasi admin)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role using JWT
    const token = request.cookies.get("authToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload || !payload.id || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    const banner = await BannerService.updateBanner(id, data);
    return NextResponse.json(banner);
  } catch (error) {
    console.error("Error updating banner:", error);

    if (error instanceof Error && error.message === "Banner tidak ditemukan") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update banner" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/banners/[id]
 * Menghapus banner berdasarkan ID (memerlukan autentikasi admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role using JWT
    const token = request.cookies.get("authToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload || !payload.id || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await BannerService.deleteBanner(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting banner:", error);

    if (error instanceof Error && error.message === "Banner tidak ditemukan") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete banner" },
      { status: 500 }
    );
  }
}
