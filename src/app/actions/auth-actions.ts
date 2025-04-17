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

export async function loginAction(email: string, password: string) {
  try {
    const { user, token } = await AuthService.loginUser(email, password);

    // Set a cookie for the session
    (
      await // Set a cookie for the session
      cookies()
    ).set({
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

export async function logoutAction() {
  try {
    (await cookies()).set({
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

export async function getCurrentUserAction(): Promise<UserSession | null> {
  const token = (await cookies()).get("authToken")?.value;

  if (!token) return null;

  const payload = AuthService.verifyToken(token);
  if (!payload) return null;

  const user = await AuthService.getCurrentUser(payload.id);
  return user;
}

export async function requireAuthAction() {
  const user = await getCurrentUserAction();

  if (!user) {
    redirect("/login");
  }

  return user;
}

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
