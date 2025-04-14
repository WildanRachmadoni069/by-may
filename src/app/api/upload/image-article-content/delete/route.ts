/**
 * API route untuk menghapus gambar konten artikel dari Cloudinary
 * Digunakan oleh editor rich text ketika gambar dihapus dari konten
 */
import { NextRequest, NextResponse } from "next/server";
import { CloudinaryService } from "@/lib/services/cloudinary-service";

export async function POST(req: NextRequest) {
  try {
    const { publicId } = await req.json();

    if (!publicId) {
      return NextResponse.json(
        { error: "Public ID diperlukan" },
        { status: 400 }
      );
    }

    const result = await CloudinaryService.init().uploader.destroy(publicId);

    if (result.result === "ok") {
      return NextResponse.json({
        message: "Gambar berhasil dihapus",
      });
    } else {
      return NextResponse.json(
        { error: "Gagal menghapus gambar" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Kesalahan menghapus gambar" },
      { status: 500 }
    );
  }
}
