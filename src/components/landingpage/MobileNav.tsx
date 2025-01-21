"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Home,
  Menu,
  MessageSquareQuote,
  Newspaper,
  Store,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathName = usePathname();
  const urlList = [
    {
      url: "/",
      title: "Home",
    },
    {
      url: "/produk",
      title: "Produk",
    },
    {
      url: "/artikel",
      title: "Artikel",
    },
    {
      url: "/tentang-kami",
      title: "Tentang Kami",
    },
    {
      url: "/faq",
      title: "FAQ",
    },
  ];
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={"outline"} size={"icon"}>
          <Menu size={24} />
        </Button>
      </SheetTrigger>
      <SheetContent side={"left"} className="md:hidden">
        <SheetHeader>
          <SheetTitle className="sr-only">Mobile Nav</SheetTitle>
        </SheetHeader>
        <div className="py-4 border-b border-gray-200">
          <Button
            variant={"default"}
            className="w-full"
            onClick={() => {
              alert("Signup clicked!");
            }}
          >
            Signup
          </Button>
        </div>
        <nav className="grid gap-1 py-4">
          {urlList.map((item, index) => {
            const isActive = pathName === item.url; // Cek apakah URL aktif

            return (
              <Link
                key={index}
                href={item.url}
                className={`text-lg font-medium text-gray-800 py-2 px-4 ${
                  isActive
                    ? "bg-accent font-bold text-primary rounded-md"
                    : "hover:text-primary" // Style untuk link aktif
                }`}
                onClick={() => setOpen(false)}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default MobileNav;
