/**
 * Common Types
 *
 * Tipe data yang digunakan di berbagai fitur aplikasi
 */

/**
 * Response standar untuk operasi yang mengembalikan status sukses/gagal
 */
export interface ApiResponse<T = void> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Format response error standar dari API
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

/**
 * Informasi paginasi standar
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Hasil terpaginasi yang berisi data dan informasi paginasi
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationInfo;
}
