import ProductCollections from "@/components/general/ProductCollections";
import ArticleCollection from "@/components/landingpage/ArticleCollection";
import BannerLandingpage from "@/components/landingpage/BannerLandingpage";
import HeroLandingpage from "@/components/landingpage/HeroLandingpage";
import MainLayout from "@/components/layouts/MainLayout";

export default function Home() {
  return (
    <MainLayout>
      <HeroLandingpage />
      <BannerLandingpage />
      <section aria-labelledby="featured-products" className="py-12">
        <ProductCollections
          title="Produk Unggulan"
          specialLabel="best"
          viewAllLink="/produk?specialLabel=best"
        />
      </section>
      <section aria-labelledby="new-products" className="py-12">
        <ProductCollections
          title="Produk Terbaru"
          specialLabel="new"
          viewAllLink="/produk?specialLabel=new"
        />
      </section>
      <section aria-labelledby="latest-articles" className="py-12">
        <ArticleCollection />
      </section>
    </MainLayout>
  );
}
