"use client";
import { create } from "zustand";

interface EditorImageState {
  // Upload states
  isUploading: boolean;
  setUploading: (isUploading: boolean) => void;

  // Delete states
  isDeleting: boolean;
  setDeleting: (isDeleting: boolean) => void;

  // Image selection states
  selectedImage: any | null;
  setSelectedImage: (image: any | null) => void;

  // Delete confirmation dialog
  isDeleteDialogOpen: boolean;
  openDeleteDialog: () => void;
  closeDeleteDialog: () => void;

  // Reset all states
  reset: () => void;
}

/**
 * Store untuk mengelola state gambar di editor
 * Menangani upload, hapus, dan pemilihan gambar
 */
export const useEditorImageStore = create<EditorImageState>((set) => ({
  // Upload states
  isUploading: false,
  setUploading: (isUploading: boolean) => set({ isUploading }),

  // Delete states
  isDeleting: false,
  setDeleting: (isDeleting: boolean) => set({ isDeleting }),

  // Image selection states
  selectedImage: null,
  setSelectedImage: (selectedImage: any | null) => set({ selectedImage }),

  // Delete confirmation dialog
  isDeleteDialogOpen: false,
  openDeleteDialog: () => set({ isDeleteDialogOpen: true }),
  closeDeleteDialog: () => set({ isDeleteDialogOpen: false }),

  // Reset all states
  reset: () =>
    set({
      isUploading: false,
      isDeleting: false,
      selectedImage: null,
      isDeleteDialogOpen: false,
    }),
}));
