import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName } = body;

    // Validate inputs
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if we're in browser environment (should never happen in API routes, but just in case)
    if (typeof window !== "undefined") {
      console.error(
        "Attempting to access Prisma from browser in /api/auth/register"
      );
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    try {
      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user in database
      const user = await db.user.create({
        data: {
          email,
          fullName,
          passwordHash: hashedPassword,
        },
      });

      // Return user without sensitive data
      return NextResponse.json(
        {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          },
        },
        { status: 201 }
      );
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
