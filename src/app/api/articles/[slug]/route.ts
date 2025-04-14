import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Get a single article by slug
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const article = await db.article.findUnique({
      where: { slug: params.slug },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Failed to fetch article:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Update an article
export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const data = await req.json();

    // Check if article exists
    const existingArticle = await db.article.findUnique({
      where: { slug: params.slug },
    });

    if (!existingArticle) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Handle publishing status change
    if (data.status === "published" && existingArticle.status !== "published") {
      data.publishedAt = new Date();
    }

    // Update the article
    const updatedArticle = await db.article.update({
      where: { slug: params.slug },
      data,
    });

    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error("Failed to update article:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Delete an article
export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check if article exists
    const article = await db.article.findUnique({
      where: { slug: params.slug },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Delete the article
    await db.article.delete({
      where: { slug: params.slug },
    });

    return NextResponse.json(
      { message: "Article deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete article:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
