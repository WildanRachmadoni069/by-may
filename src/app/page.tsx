import ProductCollections from "@/components/general/ProductCollections";
import ArticleCollection from "@/components/landingpage/ArticleCollection";
import BannerLandingpage from "@/components/landingpage/BannerLandingpage";
import HeroLandingpage from "@/components/landingpage/HeroLandingpage";
import MainNav from "@/components/landingpage/MainNav";

export default function Home() {
  return (
    <>
      <MainNav />
      <main>
        <HeroLandingpage />
        <BannerLandingpage />
        <section aria-labelledby="featured-products" className="py-12">
          <ProductCollections title="Produk Unggulan" />
        </section>
        <section aria-labelledby="new-products" className="py-12">
          <ProductCollections title="Produk Terbaru" />
        </section>
        <section aria-labelledby="latest-articles" className="py-12">
          <ArticleCollection />
        </section>
      </main>
    </>
  );
}
