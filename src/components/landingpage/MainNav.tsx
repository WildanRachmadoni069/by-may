"use client";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";
import MobileNav from "./MobileNav";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import CartButton with no SSR
const CartButton = dynamic(() => import("./CartButton"), { ssr: false });

function MainNav() {
  const pathName = usePathname();
  return (
    <header className="bg-white sticky top-0 left-0 right-0 z-50 border-b-2">
      <div className="mx-auto container px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="md:flex md:items-center md:gap-12">
            <Link className="block text-primary" href="/">
              <span className="sr-only">Home</span>
              <Image
                src={"/img/Logo.jpg"}
                alt="Logo Bymayscarf"
                width={64}
                height={64}
              />
            </Link>
          </div>
          {/* Dekstop nav */}
          <div className="hidden md:block">
            <nav aria-label="Global">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link href="/" legacyBehavior passHref>
                      <NavigationMenuLink
                        active={pathName == "/"}
                        className={navigationMenuTriggerStyle()}
                      >
                        Beranda
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/produk" legacyBehavior passHref>
                      <NavigationMenuLink
                        active={pathName == "/produk"}
                        className={navigationMenuTriggerStyle()}
                      >
                        Produk
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/artikel" legacyBehavior passHref>
                      <NavigationMenuLink
                        active={pathName.includes("/artikel")}
                        className={navigationMenuTriggerStyle()}
                      >
                        Artikel
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/tentang-kami" legacyBehavior passHref>
                      <NavigationMenuLink
                        active={pathName == "/tentang-kami"}
                        className={navigationMenuTriggerStyle()}
                      >
                        Tentang Kami
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/faq" legacyBehavior passHref>
                      <NavigationMenuLink
                        active={pathName == "/faq"}
                        className={navigationMenuTriggerStyle()}
                      >
                        FAQ
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="sm:flex sm:gap-4">
              <CartButton />
              <Button asChild variant={"outline"}>
                <Link href="/login">Masuk</Link>
              </Button>
              <div className="hidden sm:flex">
                <Button asChild variant={"default"}>
                  <Link href="/sign-up">Daftar</Link>
                </Button>
              </div>
              <div className="hidden sm:flex">
                <Button asChild variant={"default"}>
                  <Link href="/dashboard/admin">Dashboard</Link>
                </Button>
              </div>
            </div>

            {/* Mobile Nav */}
            <div className="block md:hidden">
              <MobileNav />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default MainNav;
