import ProductCollections from "@/components/general/ProductCollections";
import ArticleCollection from "@/components/landingpage/ArticleCollection";
import BannerLandingpage from "@/components/landingpage/BannerLandingpage";
import HeroLandingpage from "@/components/landingpage/HeroLandingpage";
import MainNav from "@/components/landingpage/MainNav";

export default function Home() {
  return (
    <>
      <MainNav />
      <HeroLandingpage />
      <BannerLandingpage />
      <ProductCollections title="Produk Unggulan" />
      <ProductCollections title="Produk Terbaru" />
      <ArticleCollection />
    </>
  );
}
