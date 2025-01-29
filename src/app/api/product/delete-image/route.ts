import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Extract public ID from Cloudinary URL
    // Example: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[public_id].[extension]
    const matches = url.match(/\/v\d+\/(.+?)\./);
    if (!matches || !matches[1]) {
      throw new Error("Could not extract public ID from URL");
    }

    const publicId = matches[1];

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return NextResponse.json({ success: true });
    } else {
      throw new Error(`Failed to delete image: ${result.result}`);
    }
  } catch (error) {
    console.error("Error deleting product image:", error);
    return NextResponse.json(
      { error: "Error deleting product image: " + (error as Error).message },
      { status: 500 }
    );
  }
}
