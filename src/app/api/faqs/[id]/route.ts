import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";

/**
 * GET /api/faqs/[id]
 * Mengambil satu FAQ berdasarkan ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const faq = await prisma.fAQ.findUnique({
      where: { id: params.id },
    });

    if (!faq) {
      return NextResponse.json(
        { error: "FAQ tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(faq);
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    return NextResponse.json({ error: "Gagal mengambil FAQ" }, { status: 500 });
  }
}

/**
 * PATCH /api/faqs/[id]
 * Memperbarui FAQ (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const data = await request.json();
    const { question, answer, order } = data;

    // Validasi input dasar
    if (
      (!question && !answer && order === undefined) ||
      question === "" ||
      answer === ""
    ) {
      return NextResponse.json(
        { error: "Data tidak valid untuk pembaruan" },
        { status: 400 }
      );
    }

    // Cek apakah FAQ ada
    const existingFAQ = await prisma.fAQ.findUnique({
      where: { id: params.id },
    });

    if (!existingFAQ) {
      return NextResponse.json(
        { error: "FAQ tidak ditemukan" },
        { status: 404 }
      );
    }

    // Update FAQ
    const updateData: any = {};
    if (question !== undefined) updateData.question = question;
    if (answer !== undefined) updateData.answer = answer;
    if (order !== undefined) updateData.order = order;

    const updatedFAQ = await prisma.fAQ.update({
      where: { id: params.id },
      data: updateData,
    });

    // Revalidate path seperti pada API products
    revalidatePath("/faq");
    revalidatePath("/dashboard/admin/faq");

    return NextResponse.json(updatedFAQ);
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui FAQ" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/faqs/[id]
 * Menghapus FAQ (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Cek apakah FAQ ada
    const existingFAQ = await prisma.fAQ.findUnique({
      where: { id: params.id },
    });

    if (!existingFAQ) {
      return NextResponse.json(
        { error: "FAQ tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hapus FAQ
    await prisma.fAQ.delete({
      where: { id: params.id },
    });

    // Revalidate path seperti pada API products
    revalidatePath("/faq");
    revalidatePath("/dashboard/admin/faq");

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return NextResponse.json({ error: "Gagal menghapus FAQ" }, { status: 500 });
  }
}
