import { notFound } from "next/navigation";
import ArticleForm from "@/components/admin/article/ArticleForm";
import type { ArticleData } from "@/types/article";
import { Suspense } from "react";
import { LoaderCircle } from "lucide-react";

// Server component data fetching
async function getArticleData(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/articles/${slug}`,
      {
        next: {
          tags: [`article-${slug}`],
          revalidate: 60, // Revalidate more frequently in admin context
        },
      }
    );

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch article: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error(`Error fetching article with slug ${slug}:`, error);
    return null;
  }
}

// Convert database article model to ArticleData format expected by the form
const mapArticleToFormData = (article: any): ArticleData => {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    content: article.content,
    excerpt: article.excerpt || "",
    featured_image: article.featured_image || { url: "", alt: "" },
    status: article.status,
    meta: article.meta || { title: "", description: "", og_image: "" },
    author: article.author || { id: "", name: "" },
    created_at: article.createdAt?.toString() || null,
    updated_at: article.updatedAt?.toString() || null,
    publishedAt: article.publishedAt?.toString() || null,
  };
};

export default async function ArticleEditPage({
  params,
}: {
  params: { slug: string };
}) {
  // Make sure params is a non-promise object
  const resolvedParams = params;
  const { slug } = await resolvedParams;

  const article = await getArticleData(slug);

  if (!article) {
    notFound();
  }

  const articleData = mapArticleToFormData(article);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Edit Artikel</h1>
        <p className="text-muted-foreground">
          Perbarui konten dan pengaturan artikel
        </p>
      </div>

      <Suspense fallback={<LoaderCircle className="animate-spin" />}>
        <ArticleForm article={articleData} />
      </Suspense>
    </div>
  );
}
