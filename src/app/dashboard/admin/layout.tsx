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
  HelpCircle,
  Search,
  Home,
  ChevronDown,
} from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import useAuthStore from "@/store/useAuthStore";

function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, userData, loading, isAdmin } = useAuthStore();

  // Get initials from user's fullName
  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Autentikasi check untuk memastikan hanya admin yang dapat mengakses
  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        router.push("/login"); // Redirect ke login jika tidak ada user
        return;
      }

      if (!isAdmin) {
        router.push("/"); // Redirect ke homepage jika bukan admin
        return;
      }
    }
  }, [currentUser, loading, isAdmin, router]);

  // Tampilkan loading spinner jika loading masih berlangsung
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Jika tidak ada user atau bukan admin, jangan render apapun (redirect akan terjadi)
  if (!currentUser || !isAdmin) {
    return null;
  }

  // Render layout admin jika semua autentikasi valid
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          {/* Logo Section */}
          <div className="px-4 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <NextImage
                src={"/img/Logo.jpg"}
                alt="Bymay Logo"
                width={36}
                height={36}
                className="rounded-md"
              />
              <h2 className="text-xl font-bold text-amber-800">Bymay</h2>
            </Link>
          </div>

          <SidebarSeparator />

          {/* Simplified Admin Profile Card */}
          <div className="px-4 py-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full">
                <div className="flex items-center gap-3 p-2.5 rounded-lg transition-colors hover:bg-black/5 w-full text-left">
                  <Avatar className="h-10 w-10 border-2 border-amber-100">
                    <AvatarImage src="" alt={userData?.fullName || "Admin"} />
                    <AvatarFallback className="bg-amber-500 text-white">
                      {getInitials(userData?.fullName || "Admin")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {userData?.fullName || "Admin"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {userData?.email}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <div className="px-2 pt-1 pb-2">
                  <h3 className="font-medium text-sm">Admin Account</h3>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/" className="flex items-center cursor-pointer">
                    <Home className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Kembali ke Beranda</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <LogoutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <SidebarSeparator className="mt-2" />

          <ScrollArea className="flex-1 h-[calc(100vh-160px)]">
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
                          isActive={pathname.includes(
                            "/dashboard/admin/product"
                          )}
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
                                pathname ===
                                "/dashboard/admin/product/collection"
                              }
                            >
                              <Link
                                href={"/dashboard/admin/product/collection"}
                              >
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
          </ScrollArea>
        </SidebarContent>
      </Sidebar>
      <main className="w-full">
        <SidebarTrigger />
        <section className="px-6 py-4">{children}</section>
      </main>
    </SidebarProvider>
  );
}

export default AdminDashboardLayout;
