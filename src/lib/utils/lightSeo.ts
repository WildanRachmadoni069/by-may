/**
 * Lightweight version of structured data for better build performance
 */

/**
 * Generate simplified homepage structured data
 * Focus only on essential SEO data without including product details during build
 */
export function generateLightHomeStructuredData() {
  // Get base URL from environment variable
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop";

  // Base website and organization structured data
  return {
    "@context": "https://schema.org",
    "@graph": [
      // Website information
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "bymayscarf",
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
        name: "bymayscarf",
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
        name: "bymayscarf - Al-Quran Custom Cover",
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
}
