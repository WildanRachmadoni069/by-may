import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createToken } from "@/lib/auth/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if we're in browser environment (should never happen in API routes, but just in case)
    if (typeof window !== "undefined") {
      console.error(
        "Attempting to access Prisma from browser in /api/auth/login"
      );
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    // Find the user
    try {
      const user = await db.user.findUnique({
        where: { email },
      });

      if (!user || !user.passwordHash) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      // Verify password
      const isValid = await verifyPassword(password, user.passwordHash);

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      // Create session data
      const userSession = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      };

      // Create JWT token
      const token = createToken(userSession);

      // Create the response
      const response = NextResponse.json({
        success: true,
        user: userSession,
      });

      // Set HTTP-only cookie with the token
      // Max age: 7 days in seconds
      response.cookies.set({
        name: "authToken",
        value: token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return response;
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
