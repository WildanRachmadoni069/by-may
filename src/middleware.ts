import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/auth";

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
export default function middleware(request: NextRequest) {
  // Get token from cookies
  const token = request.cookies.get("authToken")?.value;

  // Get pathname
  const { pathname } = request.nextUrl;

  // Create URL for redirects
  const url = request.nextUrl.clone();

  // Define authentication pages
  const authPages = ["/login", "/sign-up"];
  const isAuthPage = authPages.includes(pathname);

  // Define admin routes
  const adminRoutes = pathname.startsWith("/admin");
  const apiAdminRoutes = pathname.startsWith("/api/admin");

  // Allow public API routes and static files without further checks
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Handle login/signup pages - redirect to home if already logged in
  if (isAuthPage && token) {
    try {
      const payload = verifyToken(token);
      if (payload) {
        // User is authenticated, redirect to home page
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // Token verification failed, continue to auth page
    }
  }

  // Check auth for admin routes
  if (adminRoutes || apiAdminRoutes) {
    // No token found - redirect to login
    if (!token) {
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    try {
      // Verify token and check user role
      const payload = verifyToken(token);
      if (!payload || payload.role !== "admin") {
        // If authenticated but not admin, redirect to home
        if (payload) {
          url.pathname = "/";
          return NextResponse.redirect(url);
        }

        // If not authenticated, redirect to login
        url.pathname = "/login";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // Token verification failed, redirect to login
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
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
