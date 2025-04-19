import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { verifyToken } from "@/lib/auth/auth";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get("authToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the URL from the request body
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Extract public_id from Cloudinary URL
    const publicId = extractPublicIdFromUrl(url);

    if (!publicId) {
      return NextResponse.json(
        { error: "Invalid Cloudinary URL" },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}

// Helper function to extract public_id from Cloudinary URL
function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Match the pattern for Cloudinary URLs
    // Example: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/filename.jpg
    const match = url.match(/\/v\d+\/(.+?)(?:\.[^.]+)?$/);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}
