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
 * Layanan Autentikasi
 *
 * Menangani semua operasi database terkait autentikasi.
 * Layanan ini dirancang untuk digunakan hanya di sisi server.
 */
export const AuthService = {
  /**
   * Mengenkripsi password menggunakan bcrypt
   *
   * @param {string} password - Password plaintext untuk dienkripsi
   * @returns {Promise<string>} Password yang sudah dienkripsi
   */
  async hashPassword(password: string): Promise<string> {
    return hash(password, 12);
  },

  /**
   * Memverifikasi password terhadap hash
   *
   * @param {string} password - Password plaintext untuk diverifikasi
   * @param {string} hashedPassword - Password terenkripsi untuk dibandingkan
   * @returns {Promise<boolean>} True jika password cocok, false jika tidak
   */
  async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return compare(password, hashedPassword);
  },

  /**
   * Membuat token JWT untuk sesi pengguna
   *
   * @param {UserSession} user - Data pengguna yang akan dienkode dalam token
   * @returns {string} Token JWT
   */
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

  /**
   * Memverifikasi token JWT dan mengembalikan sesi pengguna
   *
   * @param {string} token - Token JWT untuk diverifikasi
   * @returns {UserSession | null} Sesi pengguna jika valid, null jika tidak
   */
  verifyToken(token: string): UserSession | null {
    try {
      return verify(token, JWT_SECRET) as UserSession;
    } catch (error) {
      return null;
    }
  },

  /**
   * Mendaftarkan pengguna baru
   *
   * @param {string} email - Email pengguna
   * @param {string} password - Password pengguna
   * @param {string} fullName - Nama lengkap pengguna
   * @returns {Promise<object>} Data pengguna yang dibuat tanpa data sensitif
   * @throws {Error} Jika email sudah terdaftar
   */
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

  /**
   * Mengautentikasi pengguna
   *
   * @param {string} email - Email pengguna
   * @param {string} password - Password pengguna
   * @returns {Promise<object>} Sesi pengguna dan token JWT
   * @throws {Error} Jika kredensial tidak valid
   */
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

  /**
   * Mendapatkan data pengguna berdasarkan ID
   *
   * @param {string} userId - ID pengguna
   * @returns {Promise<UserSession | null>} Data pengguna tanpa field sensitif
   */
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
