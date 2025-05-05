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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useLogoutDialog } from "@/components/dashboard/LogoutDialog";
import useAuthStore from "@/store/useAuthStore";

// Dynamically import CartButton with no SSR
const CartButton = dynamic(() => import("./CartButton"), { ssr: false });

function MainNav() {
  const pathName = usePathname();
  const { currentUser, isAdmin } = useAuthStore();
  const { setOpen: setLogoutDialogOpen } = useLogoutDialog();

  // Get initials from user's fullName
  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

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
            <div className="flex items-center gap-4">
              <CartButton />

              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer h-9 w-9 border-2 border-primary/20 hover:border-primary/40 transition-all duration-200 shadow-sm hover:shadow">
                      <AvatarImage
                        src=""
                        alt={currentUser?.fullName || "User"}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary/90 to-primary/70 text-white font-medium text-sm">
                        {getInitials(currentUser?.fullName || "User")}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="p-2 border-b">
                      <div className="font-semibold truncate max-w-full">
                        {currentUser?.fullName || "User"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-full mt-0.5">
                        {currentUser?.email}
                      </div>
                    </div>
                    <DropdownMenuSeparator />

                    {isAdmin ? (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/admin"
                          className="flex items-center gap-2 text-amber-600 font-medium cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-layout-dashboard"
                          >
                            <rect width="7" height="9" x="3" y="3" rx="1" />
                            <rect width="7" height="5" x="14" y="3" rx="1" />
                            <rect width="7" height="9" x="14" y="12" rx="1" />
                            <rect width="7" height="5" x="3" y="16" rx="1" />
                          </svg>
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/profil"
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-user"
                          >
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          Profil Saya
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem asChild>
                      <Link
                        href="/pesanan"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-package"
                        >
                          <path d="m7.5 4.27 9 5.15" />
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                          <path d="m3.3 7 8.7 5 8.7-5" />
                          <path d="M12 12v9" />
                        </svg>
                        Pesanan Saya
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => setLogoutDialogOpen(true)}
                      className="text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button asChild variant={"outline"}>
                    <Link href="/login">Masuk</Link>
                  </Button>
                  <div className="hidden sm:flex">
                    <Button asChild variant={"default"}>
                      <Link href="/sign-up">Daftar</Link>
                    </Button>
                  </div>
                </>
              )}
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
