"use client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  ChevronRight,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Newspaper,
  Image,
  HelpCircle, // Added HelpCircle icon for FAQ
  Search, // Add this for the SEO icon
} from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarHeader className="flex flex-row items-center py-0">
            <NextImage
              src={"/img/Logo.jpg"}
              alt="Bymay Logo"
              width={60}
              height={60}
            />
            <h2 className="text-2xl font-extrabold text-amber-800">Bymay</h2>
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard/admin"}
                  >
                    <Link href="/dashboard/admin">
                      <LayoutDashboard className="text-primary" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard/admin/order"}
                  >
                    <Link href="/dashboard/admin/order">
                      <ShoppingCart className="text-primary" />
                      <span>Pesanan</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard/admin/users"}
                  >
                    <Link href="/dashboard/admin/users">
                      <Users className="text-primary" />
                      <span>Pengguna</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard/admin/banner"}
                  >
                    <Link href="/dashboard/admin/banner">
                      <Image className="text-primary" />
                      <span>Banner</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard/admin/artikel"}
                  >
                    <Link href="/dashboard/admin/artikel">
                      <Newspaper className="text-primary" />
                      <span>Artikel</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {/* Add FAQ menu item */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.includes("/dashboard/admin/faq")}
                  >
                    <Link href="/dashboard/admin/faq">
                      <HelpCircle className="text-primary" />
                      <span>FAQ</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Add SEO Settings menu item */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.includes("/dashboard/admin/seo")}
                  >
                    <Link href="/dashboard/admin/seo">
                      <Search className="text-primary" />
                      <span>SEO</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <Collapsible className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={pathname.includes("/dashboard/admin/product")}
                      >
                        <Package className="text-primary" />
                        <span>Produk</span>
                        <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === "/dashboard/admin/product"}
                          >
                            <Link href={"/dashboard/admin/product"}>
                              Semua Produk
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={
                              pathname === "/dashboard/admin/product/category"
                            }
                          >
                            <Link href={"/dashboard/admin/product/category"}>
                              Kategori
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={
                              pathname === "/dashboard/admin/product/collection"
                            }
                          >
                            <Link href={"/dashboard/admin/product/collection"}>
                              Koleksi
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className="w-full">
        <SidebarTrigger />
        <section className="px-6">{children}</section>
      </main>
    </SidebarProvider>
  );
}

export default AdminDashboardLayout;
