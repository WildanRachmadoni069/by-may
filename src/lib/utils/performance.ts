/**
 * Utils for optimization web performance and SEO
 */

import { useEffect, useState, RefObject } from "react";

/**
 * Hook to implement lazy loading based on intersection observer
 * @param ref Reference to the element to observe
 * @param options Intersection observer options
 * @returns Boolean indicating if the element is in viewport
 */
export function useInView<T extends HTMLElement>(
  ref: RefObject<T>,
  options = {
    threshold: 0.1,
    rootMargin: "0px",
    triggerOnce: true,
  }
): boolean {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref.current || (options.triggerOnce && isInView)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update state when in viewport
        if (entry.isIntersecting) {
          setIsInView(true);

          // Disconnect observer if triggerOnce is true
          if (options.triggerOnce && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!options.triggerOnce) {
          setIsInView(false);
        }
      },
      {
        threshold: options.threshold,
        rootMargin: options.rootMargin,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [
    ref,
    options.threshold,
    options.rootMargin,
    options.triggerOnce,
    isInView,
  ]);

  return isInView;
}

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
  const publishDate =
    article.publishedAt || article.createdAt || new Date().toISOString();
  const modifiedDate = article.updatedAt || publishDate;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    image: article.featuredImage?.url || "",
    datePublished:
      typeof publishDate === "object"
        ? publishDate.toISOString()
        : String(publishDate),
    dateModified:
      typeof modifiedDate === "object"
        ? modifiedDate.toISOString()
        : String(modifiedDate),
    author: {
      "@type": "Person",
      name: article.author?.name || "By May Scarf",
    },
    publisher: {
      "@type": "Organization",
      name: "By May Scarf",
      logo: {
        "@type": "ImageObject",
        url: "https://bymayscarf.com/img/Logo.jpg",
      },
    },
    description: article.excerpt || "",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://bymayscarf.com/artikel/${article.slug}`,
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
