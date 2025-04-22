import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { verifyToken } from "@/lib/auth/auth";
import { CloudinaryService } from "@/lib/services/cloudinary-service";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Extract public_id from Cloudinary URL
 */
function extractPublicIdFromUrl(url: string): string | null {
  try {
    if (!url || typeof url !== "string") return null;

    // Extract the part after /upload/
    const uploadMatch = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (!uploadMatch || !uploadMatch[1]) {
      return null;
    }

    // Remove any transformation parameters and file extension
    let publicId = uploadMatch[1];

    // Remove file extension if present
    if (publicId.includes(".")) {
      publicId = publicId.substring(0, publicId.lastIndexOf("."));
    }

    return publicId;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Cloudinary delete API called");

    // Get the data from request body
    const body = await request.json().catch((e) => {
      console.error("Failed to parse request body:", e);
      return {};
    });

    console.log("Request body:", body);

    // Extract necessary data - support both direct publicId and url
    const { url, publicId: directPublicId } = body;

    // Track if we had public ID directly or extracted it
    let imageId: string | null = null;
    let fromUrl = false;

    // Handle missing required parameters
    if (!directPublicId && !url) {
      return NextResponse.json(
        { error: "Either image URL or publicId is required" },
        { status: 400 }
      );
    }

    // If publicId is provided directly, use it
    if (directPublicId) {
      imageId = directPublicId;
    }
    // If only URL is provided, extract publicId from URL
    else if (url) {
      fromUrl = true;
      imageId = extractPublicIdFromUrl(url);

      if (!imageId) {
        return NextResponse.json(
          { error: "Unable to extract publicId from URL", url },
          { status: 400 }
        );
      }
    }

    console.log(
      `Attempting to delete image with publicId: ${imageId}, fromUrl: ${fromUrl}`
    );

    try {
      // Delete from Cloudinary
      const result = await cloudinary.uploader.destroy(imageId!);
      console.log(`Cloudinary delete result:`, result);

      return NextResponse.json({
        success: true,
        result,
      });
    } catch (cloudinaryError: any) {
      console.error("Cloudinary API error:", cloudinaryError);

      // If resource not found but we're deleting, consider it a success
      if (cloudinaryError.error?.message?.includes("not found")) {
        return NextResponse.json({
          success: true,
          result: { result: "not found" },
          message:
            "Resource not found in Cloudinary (already deleted or never existed)",
        });
      }

      return NextResponse.json(
        {
          error: "Cloudinary API error",
          details: cloudinaryError?.error?.message || String(cloudinaryError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("General error in Cloudinary deletion endpoint:", error);
    return NextResponse.json(
      {
        error: "Failed to process delete request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
