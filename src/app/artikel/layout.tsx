import MainNav from "@/components/landingpage/MainNav";
import React from "react";

function ArticleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainNav />
      {children}
    </>
  );
}

export default ArticleLayout;
