"use client";

import MainNav from "@/components/landingpage/MainNav";
import Footer from "@/components/landingpage/Footer";
import React from "react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <MainNav />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
