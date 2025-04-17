import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/auth";
import { db } from "@/lib/db";

/**
 * GET /api/auth/me
 *
 * Mengambil data pengguna yang sedang login berdasarkan token autentikasi dalam cookie.
 * Mengembalikan informasi pengguna jika terotentikasi, atau null jika tidak.
 *
 * @param {NextRequest} req - Objek permintaan masuk
 * @returns {Promise<NextResponse>} Respons JSON dengan data pengguna atau error
 */
export async function GET(req: NextRequest) {
  try {
    // Get token from cookies
    const token = req.cookies.get("authToken")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload || !payload.id) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Verify user still exists and get fresh data
    try {
      const user = await db.user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
        },
      });

      if (!user) {
        return NextResponse.json({ user: null }, { status: 401 });
      }

      // Return user with explicit role field
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      });
    } catch (dbError) {
      return NextResponse.json(
        { user: null, error: "Database error" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
