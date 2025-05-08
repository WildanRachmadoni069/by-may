import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth/auth";
import { Prisma } from "@prisma/client"; // Import Prisma namespace

/**
 * GET /api/faqs
 * Mengambil daftar FAQ dengan paginasi dan pencarian
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;

    // Validasi input
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 && limit <= 100 ? limit : 10;
    const skip = (validPage - 1) * validLimit;

    // Buat query filter dengan Prisma QueryMode enum
    const where = search
      ? {
          OR: [
            {
              question: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              answer: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
          ],
        }
      : {};

    // Ambil total count untuk paginasi
    const total = await prisma.fAQ.count({ where });

    // Ambil data dengan paginasi
    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: { order: "asc" },
      skip,
      take: validLimit,
    });

    return NextResponse.json({
      faqs,
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        totalPages: Math.ceil(total / validLimit),
      },
    });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data FAQ" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/faqs
 * Membuat FAQ baru (admin only)
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

    const data = await request.json();
    const { question, answer } = data;

    // Validasi input
    if (!question || !answer) {
      return NextResponse.json(
        { error: "Pertanyaan dan jawaban harus diisi" },
        { status: 400 }
      );
    }

    // Temukan order tertinggi
    const highestOrder = await prisma.fAQ.findFirst({
      orderBy: { order: "desc" },
    });
    const nextOrder = highestOrder ? highestOrder.order + 1 : 0;

    // Buat FAQ baru
    const faq = await prisma.fAQ.create({
      data: {
        question,
        answer,
        order: nextOrder,
      },
    });

    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return NextResponse.json({ error: "Gagal membuat FAQ" }, { status: 500 });
  }
}
