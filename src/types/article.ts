export interface ArticleData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: {
    url: string;
    alt: string;
  };
  status: "draft" | "published";
  meta: {
    title: string;
    description: string;
    og_image: string;
  };
  author: {
    id: string;
    name: string;
  };
  created_at: string | null; // Changed from 'any' to string | null
  updated_at: string | null; // Changed from 'any' to string | null
}
