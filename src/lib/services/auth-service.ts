"use server";

/**
 * Auth Service
 *
 * This service handles all authentication-related database operations.
 * Always used server-side only.
 */
import { db } from "@/lib/db";
import { compare, hash } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

export type UserSession = {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
};

export const AuthService = {
  // Hash password before storing
  async hashPassword(password: string): Promise<string> {
    return hash(password, 12);
  },

  // Compare provided password with stored hash
  async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return compare(password, hashedPassword);
  },

  // Create a JWT token
  createToken(user: UserSession): string {
    return sign(
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
  },

  // Verify JWT token
  verifyToken(token: string): UserSession | null {
    try {
      return verify(token, JWT_SECRET) as UserSession;
    } catch (error) {
      return null;
    }
  },

  // Register a new user
  async registerUser(email: string, password: string, fullName: string) {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("Email already registered");
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user in database
    const user = await db.user.create({
      data: {
        email,
        fullName,
        passwordHash: hashedPassword,
      },
    });

    // Return user without password
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
  },

  // Login user
  async loginUser(email: string, password: string) {
    // Find the user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isValid = await this.verifyPassword(password, user.passwordHash);

    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    // Create and return session data with JWT token
    const userSession: UserSession = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };

    return {
      user: userSession,
      token: this.createToken(userSession),
    };
  },

  // Get current user from token
  async getCurrentUser(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });

    if (!user) return null;

    return user;
  },
};
