import MainNav from "@/components/landingpage/MainNav";
import React from "react";

function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainNav />
      {children}
    </>
  );
}

export default FAQLayout;
