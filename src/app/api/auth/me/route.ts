import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Get token from cookies
    const token = req.cookies.get("authToken")?.value;
    console.log("Token found:", !!token);

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Verify token
    const payload = verifyToken(token);
    console.log("Token payload:", payload?.id, payload?.role);

    if (!payload || !payload.id) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Check if we're in browser environment (should never happen in API routes)
    if (typeof window !== "undefined") {
      console.error("Browser environment detected in API route");
      return NextResponse.json({ user: null }, { status: 500 });
    }

    // Verify user still exists and get fresh data
    try {
      const user = await db.user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
        },
      });

      if (!user) {
        console.log("User not found:", payload.id);
        return NextResponse.json({ user: null }, { status: 401 });
      }

      console.log("User retrieved:", user.email, "Role:", user.role);

      // Return user with explicit role field
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { user: null, error: "Database error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
