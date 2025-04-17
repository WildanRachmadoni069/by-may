/**
 * Auth API Client
 *
 * Menyediakan fungsi untuk berinteraksi dengan API autentikasi
 * dari komponen client.
 */

/**
 * Objek pengguna yang mewakili pengguna terotentikasi
 */
export type User = {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
};

/**
 * Mendaftarkan pengguna baru
 *
 * @param {object} data - Data pendaftaran
 * @param {string} data.fullName - Nama lengkap pengguna
 * @param {string} data.email - Email pengguna
 * @param {string} data.password - Password pengguna
 * @returns {Promise<object>} Hasil pendaftaran
 * @throws {Error} Jika pendaftaran gagal
 */
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

/**
 * Melakukan login pengguna
 *
 * @param {object} data - Kredensial login
 * @param {string} data.email - Email pengguna
 * @param {string} data.password - Password pengguna
 * @returns {Promise<object>} Hasil login dengan data pengguna
 * @throws {Error} Jika login gagal
 */
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

/**
 * Melakukan logout pengguna saat ini
 *
 * @returns {Promise<object>} Hasil logout
 * @throws {Error} Jika logout gagal
 */
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

/**
 * Mendapatkan pengguna yang sedang login
 *
 * @returns {Promise<User | null>} Pengguna saat ini atau null jika tidak terotentikasi
 */
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
    return null;
  }
}
