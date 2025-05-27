import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { logError } from "@/lib/debug";

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
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ user: null }, { status: 200 });
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
        // Return 200 if user not found since we'll just treat it as no auth
        return NextResponse.json({ user: null }, { status: 200 });
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
      logError("auth/me/db", dbError);
      return NextResponse.json({ user: null }, { status: 500 });
    }
  } catch (error) {
    logError("auth/me", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
