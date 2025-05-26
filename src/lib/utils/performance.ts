/**
 * Utils for optimization web performance and SEO
 */

/**
 * Helper function to generate JSON-LD string for structured data
 * @param structuredData The structured data object
 * @returns JSON string of structured data
 */
export function generateJsonLd(structuredData: Record<string, any>): string {
  return JSON.stringify(structuredData);
}

/**
 * Default structured data for the website
 */
export const defaultStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "By May Scarf",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop",
  logo: `${
    process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop"
  }/img/Logo.webp`,
  description:
    "Jual Al-Quran custom nama di cover murah berkualitas. Berbagai pilihan desain dan warna.",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+62-XXX-XXX-XXXX",
    contactType: "customer service",
    availableLanguage: ["Indonesian"],
  },
};

/**
 * Generate product structured data
 * @param product Product data
 * @returns Product structured data object
 */
export function generateProductStructuredData(product: any) {
  const basePrice = product.priceVariants?.[0]?.price || product.price;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop";
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images?.[0]?.url || "",
    description: product.description,
    sku: product.sku || product.id,
    mpn: product.id,
    brand: {
      "@type": "Brand",
      name: "bymayscarf",
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/produk/${product.slug}`,
      priceCurrency: "IDR",
      price: basePrice,
      priceValidUntil: oneYearFromNow.toISOString().split("T")[0],
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "By May Scarf",
      },
    },
  };
}

/**
 * Generate article structured data
 * @param article Article data
 * @returns Article structured data object
 */
export function generateArticleStructuredData(article: any) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop";
  const articleUrl = `${baseUrl}/artikel/${article.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": articleUrl,
    headline: article.title,
    name: article.title,
    description: article.excerpt || "",
    datePublished:
      article.publishedAt?.toString() || article.createdAt?.toString(),
    dateModified:
      article.updatedAt?.toString() || article.createdAt?.toString(),
    wordCount: article.content
      ? article.content.replace(/<[^>]*>/g, "").split(/\s+/).length
      : undefined,
    articleBody: article.content ? article.content.replace(/<[^>]*>/g, "") : "",
    author: {
      "@type": "Person",
      name: article.author?.name || "By May Scarf",
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "By May Scarf",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/img/Logo.webp`,
      },
    },
    image: article.featuredImage && {
      "@type": "ImageObject",
      url: article.featuredImage.url,
      width: 1200,
      height: 630,
      caption: article.featuredImage.alt || article.title,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    isAccessibleForFree: true,
    isPartOf: {
      "@type": "WebSite",
      "@id": baseUrl,
      name: "By May Scarf",
      description:
        "Menjual Al-Quran custom cover dan perlengkapan sholat berkualitas",
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@id": baseUrl,
            name: "Beranda",
          },
        },
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@id": `${baseUrl}/artikel`,
            name: "Artikel",
          },
        },
        {
          "@type": "ListItem",
          position: 3,
          item: {
            "@id": articleUrl,
            name: article.title,
          },
        },
      ],
    },
  };
}

/**
 * Generate FAQ structured data
 * @param faqs Array of FAQ items with question and answer
 * @returns FAQ structured data object
 */
export function generateFAQStructuredData(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate LocalBusiness structured data
 * @returns LocalBusiness structured data for the business
 */
export function generateLocalBusinessStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop";

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${baseUrl}/#localbusiness`,
    name: "By May Scarf",
    image: `${baseUrl}/img/Logo.webp`,
    url: baseUrl,
    telephone: "+62 851-6179-0424",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Jalan Example No. 123",
      addressLocality: "Jakarta",
      postalCode: "12345",
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -6.2,
      longitude: 106.8,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "17:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "09:00",
        closes: "14:00",
      },
    ],
    priceRange: "Rp100.000 - Rp500.000",
  };
}

export function generateShoppingCenterStructuredData(products: any[] = []) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop";

  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "By May Scarf Online Store",
    image: `${baseUrl}/img/Logo.webp`,
    url: `${baseUrl}/produk`,
    telephone: "+62 851-6179-0424",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Online Store",
      addressCountry: "ID",
    },
    makesOffer: products.slice(0, 3).map((product: any) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: product.name,
        description: product.description || "",
        image: product.images?.[0]?.url || "",
        url: `${baseUrl}/produk/${product.slug}`,
      },
    })),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/produk?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate Homepage structured data
 * @returns Homepage structured data object with WebSite, Organization and ItemList
 */
export function generateHomeStructuredData(
  featuredProducts: any[] = [],
  newProducts: any[] = [],
  testimonials: any[] = []
) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop";

  // Base website and organization structured data
  const baseStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      // Website information
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "By May Scarf",
        description:
          "Jual Al-Quran custom nama di cover murah berkualitas. Berbagai pilihan desain dan warna.",
        publisher: {
          "@id": `${baseUrl}/#organization`,
        },
        potentialAction: [
          {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${baseUrl}/produk?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        ],
      },
      // Organization information
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: "By May Scarf",
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/img/Logo.webp`,
          width: 180,
          height: 60,
        },
        sameAs: [
          "https://www.instagram.com/by.mayofficial/",
          "https://www.tiktok.com/@by.mayofficial",
          "https://shopee.co.id/by.may",
          "https://www.lazada.co.id/shop/by-may/",
          "https://www.tokopedia.com/by-mayscarf/",
        ],
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: "+62 851-6179-0424",
            contactType: "customer service",
            availableLanguage: ["Indonesian"],
          },
        ],
      },
      // WebPage information
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/#webpage`,
        url: baseUrl,
        name: "By May Scarf - Al-Quran Custom Cover",
        isPartOf: {
          "@id": `${baseUrl}/#website`,
        },
        about: {
          "@id": `${baseUrl}/#organization`,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${baseUrl}/img/Landing-Page/header-image.webp`,
        },
        datePublished: "2023-01-01T08:00:00+08:00",
        dateModified: new Date().toISOString(),
        inLanguage: "id-ID",
        potentialAction: [
          {
            "@type": "ReadAction",
            target: [baseUrl],
          },
        ],
      },
      // BreadcrumbList for homepage
      {
        "@type": "BreadcrumbList",
        "@id": `${baseUrl}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Beranda",
            item: baseUrl,
          },
        ],
      },
    ],
  };

  // Add featured product list if available
  if (featuredProducts && featuredProducts.length > 0) {
    baseStructuredData["@graph"].push({
      "@type": "ItemList",
      "@id": `${baseUrl}/#featuredproducts`,
      name: "Produk Unggulan",
      numberOfItems: featuredProducts.length,
      itemListElement: featuredProducts
        .slice(0, 10)
        .map((product: any, index: number) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            name: product.name,
            url: `${baseUrl}/produk/${product.slug}`,
            image: product.images?.[0]?.url || "",
            description: product.description || "",
            offers: {
              "@type": "Offer",
              price: product.priceVariants?.[0]?.price || product.price,
              priceCurrency: "IDR",
              availability:
                product.stock > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
            },
          },
        })),
    } as any);
  }

  // Add new product list if available
  if (newProducts && newProducts.length > 0) {
    baseStructuredData["@graph"].push({
      "@type": "ItemList",
      "@id": `${baseUrl}/#newproducts`,
      name: "Produk Terbaru",
      numberOfItems: newProducts.length,
      itemListElement: newProducts
        .slice(0, 10)
        .map((product: any, index: number) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            name: product.name,
            url: `${baseUrl}/produk/${product.slug}`,
            image: product.images?.[0]?.url || "",
            description: product.description || "",
            offers: {
              "@type": "Offer",
              price: product.priceVariants?.[0]?.price || product.price,
              priceCurrency: "IDR",
              availability:
                product.stock > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
            },
          },
        })),
    } as any);
  }

  // Add testimonials/reviews if available
  if (testimonials && testimonials.length > 0) {
    baseStructuredData["@graph"].push({
      "@type": "ItemList",
      "@id": `${baseUrl}/#testimonials`,
      name: "Testimonial Pelanggan",
      numberOfItems: testimonials.length,
      itemListElement: testimonials
        .slice(0, 5)
        .map((testimonial: any, index: number) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: testimonial.rating || 5,
              bestRating: 5,
            },
            author: {
              "@type": "Person",
              name: testimonial.name || "Pelanggan bymayscarf",
            },
            reviewBody: testimonial.content || "",
          },
        })),
    } as any);
  }

  return baseStructuredData;
}
