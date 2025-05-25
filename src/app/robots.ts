import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/dashboard/admin/", "/login", "/sign-up"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
