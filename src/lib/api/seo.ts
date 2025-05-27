import {
  CreateSEOSettingInput,
  SEOSetting,
  UpdateSEOSettingInput,
} from "@/types/seo";

/**
 * Mendapatkan semua pengaturan SEO
 * @returns Semua pengaturan SEO
 */
export async function getSEOSettings(): Promise<SEOSetting[]> {
  const response = await fetch("/api/seo");

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch SEO settings");
  }

  return response.json();
}

/**
 * Mendapatkan pengaturan SEO untuk halaman tertentu
 * @param pageId ID halaman yang ingin diambil pengaturan SEO-nya
 * @returns Pengaturan SEO untuk halaman tertentu, atau null jika tidak ditemukan
 */
export async function getSEOSetting(
  pageId: string
): Promise<SEOSetting | null> {
  const response = await fetch(`/api/seo/${pageId}`);

  // If status is 404, return null instead of throwing an error
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || `Failed to fetch SEO setting for page ${pageId}`
    );
  }

  return response.json();
}

/**
 * Membuat pengaturan SEO baru
 * @param data Data untuk membuat pengaturan SEO baru
 * @returns Pengaturan SEO yang baru dibuat
 */
export async function createSEOSetting(
  data: CreateSEOSettingInput
): Promise<SEOSetting> {
  const response = await fetch("/api/seo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create SEO setting");
  }

  return response.json();
}

/**
 * Memperbarui pengaturan SEO yang sudah ada
 * @param pageId ID halaman yang pengaturan SEO-nya ingin diperbarui
 * @param data Data untuk memperbarui pengaturan SEO
 * @returns Pengaturan SEO yang diperbarui
 */
export async function updateSEOSetting(
  pageId: string,
  data: UpdateSEOSettingInput
): Promise<SEOSetting> {
  const response = await fetch(`/api/seo/${pageId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || `Failed to update SEO setting for page ${pageId}`
    );
  }

  return response.json();
}

/**
 * Menghapus pengaturan SEO
 * @param pageId ID halaman yang pengaturan SEO-nya ingin dihapus
 * @returns Respons dari server
 */
export async function deleteSEOSetting(pageId: string): Promise<void> {
  const response = await fetch(`/api/seo/${pageId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || `Failed to delete SEO setting for page ${pageId}`
    );
  }
}
