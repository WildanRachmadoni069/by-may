/**
 * Common Types
 *
 * Tipe data yang digunakan di berbagai fitur aplikasi
 */

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
