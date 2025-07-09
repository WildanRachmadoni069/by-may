import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/dashboard/admin/",
          "/login",
          "/sign-up",
          "/api/",
          "/_next/",
          "/.*\\?.*", // Avoid crawling URLs with query parameters that might cause redirects
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/api/sitemap", "/sitemap.xml"],
        disallow: [
          "/dashboard/",
          "/dashboard/admin/",
          "/login",
          "/sign-up",
          "/api/",
          "/_next/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
