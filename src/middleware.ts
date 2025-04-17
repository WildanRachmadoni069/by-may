import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth/auth";

// List of paths that require authentication
const authProtectedPaths = ["/profil", "/pesanan"];

// Don't middleware-protect admin paths - we'll handle admin auth in the layout
const adminProtectedPaths: string[] = [];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const isAuthProtected = authProtectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // If path is not protected, allow access
  if (!isAuthProtected) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get("authToken")?.value;

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  const user = verifyToken(token);

  // If token is invalid, redirect to login
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token is valid, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - dashboard/admin (admin pages - handled separately)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|img|font|dashboard/admin).*)",
  ],
};
