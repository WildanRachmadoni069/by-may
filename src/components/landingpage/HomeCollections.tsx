"use client";

import dynamic from "next/dynamic";

// Dynamic imports with SSR disabled
const ProductCollections = dynamic(
  () => import("@/components/general/ProductCollections"),
  { ssr: false }
);

const ArticleCollection = dynamic(
  () => import("@/components/landingpage/ArticleCollection"),
  { ssr: false }
);

interface HomeCollectionsProps {
  featuredProductsTitle: string;
  featuredProductsLink?: string;
  newProductsTitle: string;
  newProductsLink?: string;
}

export default function HomeCollections({
  featuredProductsTitle,
  featuredProductsLink,
  newProductsTitle,
  newProductsLink,
}: HomeCollectionsProps) {
  return (
    <>
      {/* Section produk unggulan */}
      <section
        aria-labelledby="featured-products"
        className="py-12"
        itemScope
        itemType="https://schema.org/CollectionPage"
      >
        <ProductCollections
          title={featuredProductsTitle}
          specialLabel="best"
          viewAllLink={featuredProductsLink}
        />
      </section>

      {/* Section produk terbaru */}
      <section
        aria-labelledby="new-products"
        className="py-12"
        itemScope
        itemType="https://schema.org/CollectionPage"
      >
        <ProductCollections
          title={newProductsTitle}
          specialLabel="new"
          viewAllLink={newProductsLink}
        />
      </section>

      {/* Section artikel terbaru */}
      <section aria-labelledby="latest-articles" className="py-12">
        <ArticleCollection />
      </section>
    </>
  );
}
