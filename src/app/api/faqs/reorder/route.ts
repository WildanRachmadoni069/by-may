import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";

/**
 * POST /api/faqs/reorder
 * Mengubah urutan FAQ (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Cek autentikasi admin menggunakan pendekatan yang sama dengan API products
    const token = request.cookies.get("authToken")?.value;
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

    const { reorderedFAQs } = await request.json();

    if (!Array.isArray(reorderedFAQs) || reorderedFAQs.length === 0) {
      return NextResponse.json(
        { error: "Format data tidak valid" },
        { status: 400 }
      );
    }

    // Update order dengan transaksi
    await db.$transaction(
      reorderedFAQs.map(({ id, order }) =>
        db.fAQ.update({
          where: { id },
          data: { order },
        })
      )
    );

    // Revalidate path seperti pada API products
    revalidatePath("/faq");
    revalidatePath("/dashboard/admin/faq");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering FAQs:", error);
    return NextResponse.json(
      { error: "Gagal mengubah urutan FAQ" },
      { status: 500 }
    );
  }
}
