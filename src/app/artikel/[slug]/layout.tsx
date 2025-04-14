import type { Metadata, ResolvingMetadata } from "next";
// Replace direct DB import with server-side data fetching
import { getArticleBySlug } from "@/lib/api/articles-server";
import { getAppUrl } from "@/lib/utils/url";

type Props = {
  params: { slug: string };
  children: React.ReactNode;
};

async function getArticleData(slug: string) {
  try {
    const res = await fetch(`${getAppUrl()}/api/articles/${slug}`, {
      next: {
        tags: [`article-${slug}`],
        revalidate: 3600, // Revalidate once per hour
      },
    });

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

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getArticleData(resolvedParams.slug);

  if (!article) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found",
    };
  }

  return {
    title: article.meta?.title || article.title,
    description: article.meta?.description || article.excerpt || "",
    openGraph: {
      title: article.meta?.title || article.title,
      description: article.meta?.description || article.excerpt || "",
      images:
        article.meta?.og_image || article.featured_image?.url
          ? [{ url: article.meta?.og_image || article.featured_image.url }]
          : [],
      type: "article",
      publishedTime: article.publishedAt || article.createdAt,
      modifiedTime: article.updatedAt,
    },
  };
}

export default function ArticleLayout({ children }: Props) {
  return <>{children}</>;
}
