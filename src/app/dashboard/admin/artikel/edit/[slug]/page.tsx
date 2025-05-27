import { notFound } from "next/navigation";
import ArticleForm from "@/components/admin/article/ArticleForm";
import type { ArticleData } from "@/types/article";
import { Suspense } from "react";
import { LoaderCircle } from "lucide-react";
import { getArticleAction } from "@/app/actions/article-actions";

// Convert database article model to ArticleData format expected by the form
const mapArticleToFormData = (article: any): ArticleData => {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    content: article.content,
    excerpt: article.excerpt || "",
    featuredImage: article.featuredImage || { url: "", alt: "" },
    status: article.status,
    meta: article.meta || { title: "", description: "", ogImage: "" },
    author: article.author || { id: "", name: "" },
    createdAt: article.createdAt?.toString() || null,
    updatedAt: article.updatedAt?.toString() || null,
    publishedAt: article.publishedAt?.toString() || null,
  };
};

export default async function ArticleEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Awaiting params untuk Next.js 15
  const { slug } = await params;

  // Use server action instead of direct database call or separate function
  const article = await getArticleAction(slug);

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
