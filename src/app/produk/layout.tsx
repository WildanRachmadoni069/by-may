// import MainNav from "@/components/landingpage/MainNav";
import { Navbar } from "@/components/landingpage/Navbar";
import React from "react";

function ProductPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

export default ProductPageLayout;
