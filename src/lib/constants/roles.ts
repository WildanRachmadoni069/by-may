/**
 * Kode role untuk aplikasi
 * Menggunakan string acak untuk meningkatkan keamanan
 */

export const ROLES = {
  ADMIN: "RT5KL9", // Kode untuk admin
  CUSTOMER: "UE72MN", // Kode untuk customer
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

// Helper function untuk mengecek apakah user adalah admin
export const isAdminRole = (role: string): boolean => {
  return role === ROLES.ADMIN;
};

// Helper function untuk mengecek apakah user adalah customer
export const isCustomerRole = (role: string): boolean => {
  return role === ROLES.CUSTOMER;
};

// Helper function untuk mendapatkan nama role yang ditampilkan
export const getRoleDisplay = (role: string): string => {
  switch (role) {
    case ROLES.ADMIN:
      return "Admin";
    case ROLES.CUSTOMER:
      return "Customer";
    default:
      return "Unknown";
  }
};
