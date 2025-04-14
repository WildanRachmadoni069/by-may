import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url) {
    return NextResponse.json(
      { error: "Image URL is required" },
      { status: 400 }
    );
  }

  try {
    // Extract public ID from Cloudinary URL
    const urlParts = url.split("/");
    const publicIdWithExtension = urlParts.pop();

    if (!publicIdWithExtension) {
      return NextResponse.json(
        { error: "Invalid Cloudinary URL format" },
        { status: 400 }
      );
    }

    const publicId = publicIdWithExtension.split(".")[0];

    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok" || result.result === "not found") {
      return NextResponse.json({
        success: true,
        message:
          result.result === "ok"
            ? "Image deleted successfully"
            : "Image not found",
      });
    } else {
      return NextResponse.json(
        { error: `Failed to delete image: ${result.result}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    return NextResponse.json(
      { error: "Error deleting image" },
      { status: 500 }
    );
  }
}
