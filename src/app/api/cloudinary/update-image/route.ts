import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { verifyToken } from "@/lib/auth/auth";

/**
 * Konfigurasi Cloudinary hanya di sisi server
 */
function initCloudinary() {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

/**
 * POST /api/cloudinary/update-image
 *
 * Update existing Cloudinary image while preserving the public ID
 * Requires admin authentication
 */
export async function POST(req: NextRequest) {
  try {
    // Check authorization
    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Handle form data
    const formData = await req.formData();
    const image = formData.get("image") as File;
    const publicId = formData.get("publicId") as string;

    if (!image || !publicId) {
      return NextResponse.json(
        { error: "Image and publicId are required" },
        { status: 400 }
      );
    }

    // Convert File to Buffer for Cloudinary upload
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Initialize Cloudinary and upload the new image
    const client = initCloudinary();

    // Create upload stream with options to override existing image
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = client.uploader.upload_stream(
        {
          public_id: publicId,
          overwrite: true,
          invalidate: true,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Write buffer to stream
      uploadStream.write(buffer);
      uploadStream.end();
    });

    return NextResponse.json(uploadResult);
  } catch (error) {
    console.error("Error in Cloudinary update:", error);
    return NextResponse.json(
      { error: "Failed to update image" },
      { status: 500 }
    );
  }
}

/**
 * Sets the maximum request body size for file uploads
 */
export const config = {
  api: {
    bodyParser: false, // Disables bodyParser to handle form data
  },
};
