import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/common";

/**
 * Membuat response error yang terstandarisasi
 * @param message Pesan error yang akan dikembalikan
 * @param status Kode status HTTP (default: 500)
 * @returns Response NextJS dengan format error yang standar
 */
export const createErrorResponse = (message: string, status: number = 500) => {
  const response: ApiResponse = {
    success: false,
    message,
  };
  return NextResponse.json(response, { status });
};

/**
 * Membuat response sukses yang terstandarisasi
 * @param data Data yang akan dikembalikan dalam response
 * @param message Pesan sukses opsional
 * @returns Response NextJS dengan format sukses yang standar
 */
export const createSuccessResponse = <T>(data: T, message?: string) => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return NextResponse.json(response);
};
