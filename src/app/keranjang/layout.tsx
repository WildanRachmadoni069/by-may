import MainNav from "@/components/landingpage/MainNav";
import React from "react";

function CartLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainNav />
      {children}
    </>
  );
}

export default CartLayout;
