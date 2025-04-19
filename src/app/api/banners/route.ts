import { NextRequest, NextResponse } from "next/server";
import { BannerService } from "@/lib/services/banner-service";
import { verifyToken } from "@/lib/auth/auth";

/**
 * GET /api/banners
 * Mengambil semua banner
 */
export async function GET() {
  try {
    const banners = await BannerService.getBanners();
    return NextResponse.json(banners);
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json(
      { error: "Failed to fetch banners" },
      { status: 500 }
    );
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload || !payload.id || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const banner = await BannerService.createBanner(data);

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error("Error creating banner:", error);
    return NextResponse.json(
      { error: "Failed to create banner" },
      { status: 500 }
    );
  }
}
