// import MainNav from "@/components/landingpage/MainNav";
import { Navbar } from "@/components/landingpage/Navbar";
import React from "react";

function ArticleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default ArticleLayout;
