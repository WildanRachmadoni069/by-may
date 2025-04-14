import type { Metadata, ResolvingMetadata } from "next";
// Replace direct DB import with server-side data fetching
import { getArticleBySlug } from "@/lib/api/articles-server";

type Props = {
  params: { slug: string };
  children: React.ReactNode;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    // Fetch article using server component data fetching
    const article = await getArticleBySlug(params.slug);

    if (!article) {
      return {
        title: "Article Not Found",
      };
    }

    // Get the meta data from the article
    const meta = (article.meta as any) || {};

    // Optionally access and extend parent metadata
    const previousImages = (await parent).openGraph?.images || [];

    return {
      title: meta.title || article.title,
      description: meta.description || article.excerpt || "",
      openGraph: {
        title: meta.title || article.title,
        description: meta.description || article.excerpt || "",
        images:
          meta.og_image || (article.featured_image as any)?.url
            ? [
                {
                  url: meta.og_image || (article.featured_image as any)?.url,
                  width: 1200,
                  height: 630,
                  alt: article.title,
                },
                ...previousImages,
              ]
            : [...previousImages],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Error Loading Article",
    };
  }
}

export default function ArticleLayout({ children }: Props) {
  return <>{children}</>;
}
