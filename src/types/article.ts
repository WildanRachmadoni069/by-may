export interface ArticleData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: {
    url: string;
    alt: string;
  } | null;
  status: "draft" | "published";
  meta: {
    title: string;
    description: string;
    og_image: string;
  } | null;
  author: {
    id: string;
    name: string;
  } | null;
  created_at: string | null;
  updated_at: string | null;
  publishedAt?: string | null;
}

// Add compatibility types to help with database integration
export interface ArticleFormData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featured_image?: {
    url: string;
    alt: string;
  } | null;
  status: "draft" | "published";
  meta: {
    title: string;
    description: string;
    og_image?: string;
  };
}
