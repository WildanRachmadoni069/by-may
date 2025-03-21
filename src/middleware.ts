import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware sederhana untuk autentikasi
 *
 * TODO: Implementasikan validasi token JWT Firebase di sini untuk
 * keamanan server-side yang lebih baik, khususnya untuk rute admin.
 */
export function middleware(req: NextRequest) {
  // Saat ini, kita hanya melewatkan request karena auth dilakukan di client-side
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/admin/:path*"],
};
