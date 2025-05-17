/**
 * Edge-compatible auth utilities
 * This file provides authentication functions compatible with Edge Runtime
 */

import { jwtVerify, SignJWT } from "jose";

// Secret key for JWT operations
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-this"
);

/**
 * Data sesi pengguna yang disertakan dalam token JWT
 */
export type UserSession = {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
};

/**
 * Membuat token JWT untuk sesi pengguna (Edge compatible)
 *
 * @param {UserSession} user - Data pengguna yang akan dienkode dalam token
 * @returns {Promise<string>} Token JWT
 */
export async function createEdgeToken(user: UserSession): Promise<string> {
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  return token;
}

/**
 * Memverifikasi token JWT dan mengembalikan sesi pengguna (Edge compatible)
 *
 * @param {string} token - Token JWT untuk diverifikasi
 * @returns {Promise<UserSession | null>} Sesi pengguna jika valid, null jika tidak
 */
export async function verifyEdgeToken(
  token: string
): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserSession;
  } catch (error) {
    return null;
  }
}
