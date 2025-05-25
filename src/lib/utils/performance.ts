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
  url: "https://bymayscarf.com",
  logo: "https://bymayscarf.com/img/Logo.jpg",
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
      name: "By May Scarf",
    },
    offers: {
      "@type": "Offer",
      url: `https://bymayscarf.com/produk/${product.slug}`,
      priceCurrency: "IDR",
      price: basePrice,
      priceValidUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      )
        .toISOString()
        .split("T")[0],
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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bymay.com";
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
        url: `${baseUrl}/img/Logo.jpg`,
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
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://bymayscarf.com/#localbusiness",
    name: "By May Scarf",
    image: "https://bymayscarf.com/img/Logo.jpg",
    url: "https://bymayscarf.com",
    telephone: "+62-XXX-XXX-XXXX",
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

/**
 * Generate Shopping Center structured data
 * @returns Shopping Center structured data
 */
export function generateShoppingCenterStructuredData(products: any[] = []) {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "By May Scarf Online Store",
    image: "https://bymayscarf.com/img/Logo.jpg",
    url: "https://bymayscarf.com/produk",
    telephone: "+62-XXX-XXX-XXXX",
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
        url: `https://bymayscarf.com/produk/${product.slug}`,
      },
    })),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://bymayscarf.com/produk?q={search_term_string}",
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
  // Base website and organization structured data
  const baseStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      // Website information
      {
        "@type": "WebSite",
        "@id": "https://bymayscarf.com/#website",
        url: "https://bymayscarf.com/",
        name: "By May Scarf",
        description:
          "Jual Al-Quran custom nama di cover murah berkualitas. Berbagai pilihan desain dan warna.",
        publisher: {
          "@id": "https://bymayscarf.com/#organization",
        },
        potentialAction: [
          {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate:
                "https://bymayscarf.com/produk?q={search_term_string}",
            },
            "query-input": "required name=search_term_string",
          },
        ],
      },
      // Organization information
      {
        "@type": "Organization",
        "@id": "https://bymayscarf.com/#organization",
        name: "By May Scarf",
        url: "https://bymayscarf.com/",
        logo: {
          "@type": "ImageObject",
          url: "https://bymayscarf.com/img/Logo.jpg",
          width: 180,
          height: 60,
        },
        sameAs: [
          "https://instagram.com/bymayscarf",
          "https://facebook.com/bymayscarf",
        ],
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: "+62-XXX-XXX-XXXX",
            contactType: "customer service",
            availableLanguage: ["Indonesian"],
          },
        ],
      },
      // WebPage information
      {
        "@type": "WebPage",
        "@id": "https://bymayscarf.com/#webpage",
        url: "https://bymayscarf.com/",
        name: "By May Scarf - Al-Quran Custom Cover",
        isPartOf: {
          "@id": "https://bymayscarf.com/#website",
        },
        about: {
          "@id": "https://bymayscarf.com/#organization",
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: "https://bymayscarf.com/img/Landing-Page/header-image.webp",
        },
        datePublished: "2023-01-01T08:00:00+08:00",
        dateModified: new Date().toISOString(),
        inLanguage: "id-ID",
        potentialAction: [
          {
            "@type": "ReadAction",
            target: ["https://bymayscarf.com/"],
          },
        ],
      },
      // BreadcrumbList for homepage
      {
        "@type": "BreadcrumbList",
        "@id": "https://bymayscarf.com/#breadcrumb",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Beranda",
            item: "https://bymayscarf.com/",
          },
        ],
      },
    ],
  };

  // Add featured product list if available
  if (featuredProducts && featuredProducts.length > 0) {
    baseStructuredData["@graph"].push({
      "@type": "ItemList",
      "@id": "https://bymayscarf.com/#featuredproducts",
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
            url: `https://bymayscarf.com/produk/${product.slug}`,
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
      "@id": "https://bymayscarf.com/#newproducts",
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
            url: `https://bymayscarf.com/produk/${product.slug}`,
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
      "@id": "https://bymayscarf.com/#testimonials",
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
              name: testimonial.name || "Pelanggan By May Scarf",
            },
            reviewBody: testimonial.content || "",
          },
        })),
    } as any);
  }

  return baseStructuredData;
}
