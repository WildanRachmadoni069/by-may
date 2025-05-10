"use client";

import MainNav from "@/components/landingpage/MainNav";
import Footer from "@/components/landingpage/Footer";
import React from "react";
import { usePathname } from "next/navigation";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();

  return (
    <>
      <MainNav />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
