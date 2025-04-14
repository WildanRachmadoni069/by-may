import { Metadata } from "next";

// Base metadata for articles
export const metadata: Metadata = {
  title: {
    template: "%s | By May Scarf",
    default: "Artikel | By May Scarf",
  },
  description: "Artikel islami di By May Scarf",
  openGraph: {
    type: "article",
    siteName: "By May Scarf",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function ArticleDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
