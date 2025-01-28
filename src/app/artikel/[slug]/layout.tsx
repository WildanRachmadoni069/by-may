import type { Metadata, ResolvingMetadata } from "next";
import { getArticleBySlug } from "@/lib/article";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    // Read route params
    const getParams = await params;
    const { slug } = getParams;

    // Fetch article data
    const article = await getArticleBySlug(slug);

    if (!article) {
      return {
        title: "Article Not Found",
      };
    }

    // Optionally access and extend parent metadata
    const previousImages = (await parent).openGraph?.images || [];

    return {
      title: article.meta.title,
      description: article.meta.description,
      openGraph: {
        title: article.meta.title,
        description: article.meta.description,
        images: [
          {
            url: article.meta.og_image || article.featured_image.url,
            width: 1200,
            height: 630,
            alt: article.title,
          },
          ...previousImages,
        ],
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
