import MainNav from "@/components/landingpage/MainNav";
import React from "react";

function TentangKamiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainNav />
      {children}
    </>
  );
}

export default TentangKamiLayout;
