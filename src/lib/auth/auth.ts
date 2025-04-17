import { compare, hash } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

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
 * Mengenkripsi password menggunakan bcrypt
 *
 * @param {string} password - Password plaintext untuk dienkripsi
 * @returns {Promise<string>} Password yang sudah dienkripsi
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

/**
 * Memverifikasi password terhadap hash
 *
 * @param {string} password - Password plaintext untuk diverifikasi
 * @param {string} hashedPassword - Password terenkripsi untuk dibandingkan
 * @returns {Promise<boolean>} True jika password cocok, false jika tidak
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

/**
 * Membuat token JWT untuk sesi pengguna
 *
 * @param {UserSession} user - Data pengguna yang akan dienkode dalam token
 * @returns {string} Token JWT
 */
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

/**
 * Memverifikasi token JWT dan mengembalikan sesi pengguna
 *
 * @param {string} token - Token JWT untuk diverifikasi
 * @returns {UserSession | null} Sesi pengguna jika valid, null jika tidak
 */
export function verifyToken(token: string): UserSession | null {
  try {
    return verify(token, JWT_SECRET) as UserSession;
  } catch (error) {
    return null;
  }
}
