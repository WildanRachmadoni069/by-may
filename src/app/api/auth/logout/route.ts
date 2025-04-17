import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

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
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to logout" },
      { status: 500 }
    );
  }
}
