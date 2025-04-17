import { compare, hash } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

export type UserSession = {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
};

// Hash password before storing
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

// Compare provided password with stored hash
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

// Create a JWT token
export function createToken(user: UserSession): string {
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
}

// Verify JWT token
export function verifyToken(token: string): UserSession | null {
  try {
    return verify(token, JWT_SECRET) as UserSession;
  } catch (error) {
    return null;
  }
}
