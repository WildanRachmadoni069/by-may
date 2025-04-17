/**
 * Auth API Client
 *
 * This module provides functions for interacting with the authentication API
 * from client components.
 */

export type User = {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
};

export async function register(data: {
  fullName: string;
  email: string;
  password: string;
}) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to register");
  }

  return res.json();
}

export async function login(data: { email: string; password: string }) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to login");
  }

  return res.json();
}

export async function logout() {
  const res = await fetch("/api/auth/logout", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to logout");
  }

  return res.json();
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch("/api/auth/me", {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 401) {
        return null;
      }
      throw new Error("Failed to get current user");
    }

    const data = await res.json();
    return data.user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
