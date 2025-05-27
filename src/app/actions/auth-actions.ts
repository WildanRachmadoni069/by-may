"use server";

/**
 * Server Actions for Authentication
 *
 * These actions can be called directly from Server Components
 * or through Client Components using the "use server" directive.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AuthService } from "@/lib/services/auth-service";
import type { UserSession } from "@/lib/services/auth-service";

/**
 * Mendaftarkan pengguna baru (server action)
 *
 * @param {string} email - Email pengguna
 * @param {string} password - Password pengguna
 * @param {string} fullName - Nama lengkap pengguna
 * @returns {Promise<object>} Status keberhasilan dan data pengguna atau error
 */
export async function registerAction(
  email: string,
  password: string,
  fullName: string
) {
  try {
    const user = await AuthService.registerUser(email, password, fullName);
    revalidatePath("/login");
    return { success: true, user };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed";
    return { success: false, error: message };
  }
}

/**
 * Melakukan login pengguna (server action)
 *
 * @param {string} email - Email pengguna
 * @param {string} password - Password pengguna
 * @returns {Promise<object>} Status keberhasilan dan data pengguna atau error
 */
export async function loginAction(email: string, password: string) {
  try {
    const { user, token } = await AuthService.loginUser(email, password);

    // Set a cookie for the session
    const cookieStore = await cookies();
    cookieStore.set({
      name: "authToken",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    revalidatePath("/");
    return { success: true, user };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return { success: false, error: message };
  }
}

/**
 * Melakukan logout pengguna (server action)
 *
 * @returns {Promise<object>} Status keberhasilan atau error
 */
export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.set({
      name: "authToken",
      value: "",
      expires: new Date(0),
      path: "/",
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Logout failed" };
  }
}

/**
 * Mendapatkan pengguna yang sedang login (server action)
 *
 * @returns {Promise<UserSession | null>} Pengguna saat ini atau null jika tidak terotentikasi
 */
export async function getCurrentUserAction(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  if (!token) return null;

  const payload = AuthService.verifyToken(token);
  if (!payload) return null;

  const user = await AuthService.getCurrentUser(payload.id);
  return user;
}

/**
 * Memerlukan autentikasi untuk melanjutkan (server action)
 * Akan mengarahkan ke halaman login jika tidak terotentikasi
 *
 * @returns {Promise<UserSession>} Pengguna saat ini
 */
export async function requireAuthAction() {
  const user = await getCurrentUserAction();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * Memerlukan hak admin untuk melanjutkan (server action)
 * Akan mengarahkan ke halaman login jika tidak terotentikasi atau ke beranda jika bukan admin
 *
 * @returns {Promise<UserSession>} Pengguna admin saat ini
 */
export async function requireAdminAction() {
  const user = await getCurrentUserAction();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/");
  }

  return user;
}
