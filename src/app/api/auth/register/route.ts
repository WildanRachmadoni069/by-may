import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/auth";

/**
 * POST /api/auth/register
 *
 * Mendaftarkan pengguna baru dengan kredensial yang diberikan.
 * Memvalidasi bahwa email belum digunakan sebelumnya.
 *
 * @param {NextRequest} req - Permintaan masuk dengan data pendaftaran
 * @returns {Promise<NextResponse>} Respons JSON dengan data pengguna atau error
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName } = body;

    // Validate inputs
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Semua kolom wajib diisi" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user in database
    const user = await db.user.create({
      data: {
        email,
        fullName,
        passwordHash: hashedPassword,
        role: "user", // Default role
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
