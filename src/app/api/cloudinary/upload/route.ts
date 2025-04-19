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
    // Check authentication using JWT token
    const token = request.cookies.get("authToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Extract upload parameters with defaults
    const folder = (formData.get("folder") as string) || "general";
    const uploadPreset = (formData.get("upload_preset") as string) || undefined;
    const tags = (formData.get("tags") as string) || undefined;
    const resourceType = (formData.get("resource_type") as string) || "auto";

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name.replace(/\s+/g, "_")}`;

    // Prepare upload options
    const uploadOptions: Record<string, any> = {
      folder: folder,
      resource_type: resourceType,
      public_id: filename.split(".")[0],
    };

    // Add optional parameters if provided
    if (uploadPreset) uploadOptions.upload_preset = uploadPreset;
    if (tags) uploadOptions.tags = tags.split(",");

    // Upload to Cloudinary
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
    console.error("Error uploading to Cloudinary:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
