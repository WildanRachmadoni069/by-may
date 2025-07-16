import { NextRequest, NextResponse } from "next/server";
import { verifyEdgeToken } from "@/lib/auth/edge-auth";

/**
 * Middleware Autentikasi
 *
 * Melindungi rute berdasarkan status autentikasi dan peran pengguna:
 * 1. Mengarahkan pengguna terotentikasi dari halaman auth
 * 2. Melindungi rute admin
 * 3. Mengizinkan akses publik ke rute auth dan file statis
 *
 * @param {NextRequest} request - Permintaan masuk
 * @returns {NextResponse} Respons atau redirect
 */
export default async function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  // 1. AUTH PAGES LOGIC (/login, /sign-up)
  if (pathname === "/login" || pathname === "/sign-up") {
    if (token) {
      try {
        const payload = await verifyEdgeToken(token);
        if (payload) {
          url.pathname = "/";
          return NextResponse.redirect(url);
        }
      } catch (error) {}
    }
    return NextResponse.next();
  }

  // 2. ADMIN ROUTES PROTECTION
  if (
    pathname.startsWith("/dashboard/admin") ||
    pathname.startsWith("/api/admin")
  ) {
    if (!token) {
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    try {
      const payload = await verifyEdgeToken(token);
      if (!payload || payload.role !== "admin") {
        if (payload) {
          url.pathname = "/";
          return NextResponse.redirect(url);
        }
        url.pathname = "/login";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // 3. USER PROTECTED ROUTES (keranjang, pesanan)
  if (pathname === "/keranjang" || pathname === "/pesanan") {
    if (!token) {
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    try {
      const payload = await verifyEdgeToken(token);
      if (!payload) {
        url.pathname = "/login";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    // Auth pages - untuk redirect logic jika sudah login
    "/login",
    "/sign-up",
    // Protected admin routes
    "/dashboard/admin/:path*",
    // Protected API routes
    "/api/admin/:path*",
    // Protected user routes
    "/keranjang",
    "/pesanan",
  ],
};
