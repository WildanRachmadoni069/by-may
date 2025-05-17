/**
 * Lightweight version of structured data for better build performance
 */

/**
 * Generate simplified homepage structured data
 * Focus only on essential SEO data without including product details during build
 */
export function generateLightHomeStructuredData() {
  // Base website and organization structured data
  return {
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
}
