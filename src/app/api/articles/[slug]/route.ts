import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// GET handler - fetch article by slug
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const article = await db.article.findUnique({
      where: { slug },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH handler - update article
export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const body = await req.json();

    // Find the article first to make sure it exists
    const existingArticle = await db.article.findUnique({
      where: { slug },
    });

    if (!existingArticle) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Check if article is being published for the first time
    let publishedAt = existingArticle.publishedAt;
    if (body.status === "published" && !existingArticle.publishedAt) {
      publishedAt = new Date();
    }

    // Update the article
    const updatedArticle = await db.article.update({
      where: { slug },
      data: {
        ...body,
        publishedAt,
      },
    });

    // Revalidate the article pages
    revalidatePath(`/artikel/${slug}`);
    revalidatePath("/artikel");

    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE handler - delete article
export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    // Delete the article
    await db.article.delete({
      where: { slug },
    });

    // Revalidate the article pages
    revalidatePath(`/artikel/${slug}`);
    revalidatePath("/artikel");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
