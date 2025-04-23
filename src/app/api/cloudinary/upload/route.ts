import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { verifyToken } from "@/lib/auth/auth";

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: NextRequest) {
  try {
    // Verifikasi autentikasi dengan token JWT
    const token = request.cookies.get("authToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Tidak terotorisasi" },
        { status: 401 }
      );
    }

    // Verifikasi token
    const payload = verifyToken(token);

    if (!payload || !payload.id) {
      return NextResponse.json(
        { error: "Tidak terotorisasi" },
        { status: 401 }
      );
    }

    // Parse data multipart form
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "File tidak disediakan" },
        { status: 400 }
      );
    }

    // Ambil parameter upload dengan nilai default
    const folder = (formData.get("folder") as string) || "general";
    const uploadPreset = (formData.get("upload_preset") as string) || undefined;
    const tags = (formData.get("tags") as string) || undefined;
    const resourceType = (formData.get("resource_type") as string) || "auto";

    // Konversi file ke buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Buat nama file unik
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name.replace(/\s+/g, "_")}`;

    // Persiapkan opsi upload
    const uploadOptions: Record<string, any> = {
      folder: folder,
      resource_type: resourceType,
      public_id: filename.split(".")[0],
    };

    // Tambahkan parameter opsional jika disediakan
    if (uploadPreset) uploadOptions.upload_preset = uploadPreset;
    if (tags) uploadOptions.tags = tags.split(",");

    // Upload ke Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(buffer);
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengupload gambar" },
      { status: 500 }
    );
  }
}
