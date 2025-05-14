"use client";
import { create } from "zustand";

interface EditorUploadState {
  isUploading: boolean;
  setUploading: (isUploading: boolean) => void;
  reset: () => void;
}

/**
 * Store untuk mengelola state upload gambar di editor
 * Digunakan untuk komunikasi antara komponen EditorImageUploader dan MyEditorArticle
 */
export const useEditorUploadState = create<EditorUploadState>((set) => ({
  isUploading: false,
  setUploading: (isUploading: boolean) => set({ isUploading }),
  reset: () => set({ isUploading: false }),
}));
