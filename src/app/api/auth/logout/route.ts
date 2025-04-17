import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * GET /api/auth/logout
 *
 * Melakukan proses logout pengguna dengan menghapus cookie autentikasi.
 * Merevalidasi halaman utama untuk memastikan data segar setelah logout.
 *
 * @returns {Promise<NextResponse>} Respons JSON menunjukkan keberhasilan atau kegagalan
 */
export async function GET() {
  try {
    // Create the response
    const response = NextResponse.json({ success: true });

    // Clear the auth cookie by setting expiration to past date
    response.cookies.set({
      name: "authToken",
      value: "",
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0), // Expire immediately
    });

    // Revalidate paths to ensure fresh data after logout
    revalidatePath("/");

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to logout" },
      { status: 500 }
    );
  }
}
