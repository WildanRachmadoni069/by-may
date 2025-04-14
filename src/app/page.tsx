import ProductCollections from "@/components/general/ProductCollections";
import ArticleCollection from "@/components/landingpage/ArticleCollection";
import BannerLandingpage from "@/components/landingpage/BannerLandingpage";
import HeroLandingpage from "@/components/landingpage/HeroLandingpage";
import MainNav from "@/components/landingpage/MainNav";
import Footer from "@/components/landingpage/Footer";
import { Navbar } from "@/components/landingpage/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroLandingpage />
        {/* <BannerLandingpage /> */}
        {/* <section aria-labelledby="featured-products" className="py-12">
          <ProductCollections title="Produk Unggulan" specialLabel="best" />
        </section>
        <section aria-labelledby="new-products" className="py-12">
          <ProductCollections title="Produk Terbaru" specialLabel="new" />
        </section> */}
        <section aria-labelledby="latest-articles" className="py-12">
          <ArticleCollection />
        </section>
      </main>
      <Footer />
    </>
  );
}
