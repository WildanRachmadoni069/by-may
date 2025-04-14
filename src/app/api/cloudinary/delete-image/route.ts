import { NextRequest, NextResponse } from "next/server";
import { ArticleService } from "@/lib/services/article-service";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    const success = await ArticleService.deleteCloudinaryImage(url);

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Image deleted successfully",
      });
    } else {
      return NextResponse.json(
        { error: "Failed to delete image" },
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
