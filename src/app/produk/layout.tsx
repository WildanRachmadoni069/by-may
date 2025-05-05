// import MainNav from "@/components/landingpage/MainNav";
import MainNav from "@/components/landingpage/MainNav";
import React from "react";

function ProductPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainNav />
      <main>{children}</main>
    </>
  );
}

export default ProductPageLayout;
