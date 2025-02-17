import React from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseConfig";
import { Metadata } from "next";

interface Props {
  children: React.ReactNode;
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const q = query(
      collection(db, "products"),
      where("slug", "==", params.slug)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const product = querySnapshot.docs[0].data();
      const seo = product.seo || {};

      return {
        title: seo.title || product.name,
        description:
          seo.description ||
          product.description?.replace(/<[^>]*>/g, "").slice(0, 160),
        keywords: seo.keywords || [],
        openGraph: {
          title: seo.title || product.name,
          description:
            seo.description ||
            product.description?.replace(/<[^>]*>/g, "").slice(0, 160),
          type: "website",
          images: product.mainImage
            ? [
                {
                  url: product.mainImage,
                  width: 1200,
                  height: 630,
                  alt: product.name,
                },
              ]
            : [],
        },
      };
    }

    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Error",
      description: "There was an error loading the product.",
    };
  }
}

function ProductDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main>{children}</main>
    </>
  );
}

export default ProductDetailLayout;
