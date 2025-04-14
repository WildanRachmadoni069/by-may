import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ArticleService } from "@/lib/services/article-service";

// Get a single article by slug
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Await params before using its properties
    const resolvedParams = await params;

    const article = await ArticleService.getArticleBySlug(resolvedParams.slug);

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

// Update an article
export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Await params before using its properties
    const resolvedParams = await params;

    const body = await req.json();

    const article = await ArticleService.updateArticle(
      resolvedParams.slug,
      body
    );

    // Revalidate the paths to ensure fresh data
    revalidatePath("/artikel");
    revalidatePath(`/artikel/${resolvedParams.slug}`);
    revalidatePath("/dashboard/admin/artikel");

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      { error: "Failed to update article" },
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
    // Await params before using its properties
    const resolvedParams = await params;

    await ArticleService.deleteArticle(resolvedParams.slug);

    // Revalidate paths
    revalidatePath("/artikel");
    revalidatePath(`/artikel/${resolvedParams.slug}`);
    revalidatePath("/dashboard/admin/artikel");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
