"use client";

import { useEditorImageUpload } from "@/hooks/useEditorImageUpload";
import { useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { useEditorImageStore } from "@/store/useEditorImageStore";
import type Quill from "quill";

/**
 * Props untuk komponen EditorImageUploader
 * @interface EditorImageUploaderProps
 * @property {Quill} quill - Instance editor Quill
 */
interface EditorImageUploaderProps {
  quill: Quill;
}

/**
 * Fungsi untuk membuat input file gambar tersembunyi
 * @returns {HTMLInputElement} Elemen input file yang sudah dikonfigurasi
 */
const createHiddenImageInput = (): HTMLInputElement => {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/png, image/gif, image/jpeg");
  input.style.display = "none";
  return input;
};

/**
 * Komponen untuk mengelola unggahan gambar ke editor Quill
 *
 * Komponen ini menambahkan fungsionalitas unggahan gambar dengan:
 * 1. Mengganti handler tombol gambar bawaan Quill
 * 2. Menampilkan dialog pemilihan file
 * 3. Mengunggah gambar ke layanan penyimpanan
 * 4. Menyisipkan gambar ke editor setelah diunggah
 */
const EditorImageUploader: React.FC<EditorImageUploaderProps> = ({ quill }) => {
  /** Referensi ke elemen input file tersembunyi */
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  /** Hook untuk fungsi unggahan gambar */
  const { uploadImage } = useEditorImageUpload();
  /** Fungsi untuk mengatur status unggahan di store global */
  const { setUploading } = useEditorImageStore();
  /** Referensi ke handler gambar asli dari Quill */
  const originalHandlerRef = useRef<any>(null);

  useEffect(() => {
    if (!quill) return;

    // Buat input file tersembunyi
    if (!imageInputRef.current) {
      imageInputRef.current = createHiddenImageInput();
      document.body.appendChild(imageInputRef.current);
    }

    // Handler untuk ketika file dipilih
    const handleFileChange = async (e: Event) => {
      const input = e.target as HTMLInputElement;
      const files = input.files;

      if (!files || files.length === 0) return;

      const file = files[0];

      // Validasi file
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Format file tidak didukung",
          description: "Silakan pilih file gambar (JPEG, PNG, GIF)",
          variant: "destructive",
        });
        return;
      } // Dapatkan posisi cursor terkini untuk menyisipkan gambar
      const range = quill.getSelection(true);

      // Nonaktifkan editor selama upload untuk menghindari interaksi
      const wasEnabled = quill.isEnabled();
      quill.disable(); // Tampilkan overlay loading daripada teks
      setUploading(true);
      try {
        // Upload ke Cloudinary dengan timeout untuk mencegah hang
        const uploadPromise = Promise.race([
          uploadImage(file, {
            upload_preset: "article_content",
            folder: "article_content",
            tags: "article,content,editor",
          }),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Upload timeout after 30s")),
              30000
            )
          ),
        ]); // Tunggu unggahan selesai dan dapatkan URL gambar
        const result = await uploadPromise;

        // Sisipkan gambar yang sudah diunggah ke editor
        quill.insertEmbed(range.index, "image", result.secure_url);

        // Pindahkan cursor setelah gambar
        quill.setSelection(range.index + 1);

        // Bersihkan input
        if (imageInputRef.current) {
          imageInputRef.current.value = "";
        }
      } catch (error) {
        // Tampilkan pesan error
        toast({
          title: "Gagal mengupload gambar",
          description:
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat mengupload",
          variant: "destructive",
        });
      } finally {
        // Nonaktifkan overlay upload
        setUploading(false);

        // Kembalikan status editor seperti semula
        if (wasEnabled) {
          quill.enable();
        }
      }
    };

    // Setup event listener untuk input file
    if (imageInputRef.current) {
      imageInputRef.current.addEventListener("change", handleFileChange);
    } // Dapatkan modul toolbar dari Quill
    const toolbar = quill.getModule("toolbar") as any;
    /*** Definisikan custom handler untuk gambar
     * Handler kustom untuk tombol gambar di toolbar
     * Memicu dialog pemilihan file saat tombol gambar diklik
     */
    function imageHandler() {
      // Klik input file tersembunyi saat tombol image di toolbar diklik
      if (imageInputRef.current) {
        imageInputRef.current.click();
      }
    }

    // Tambahkan custom handler ke toolbar
    // Sesuai dokumentasi: toolbar.addHandler('image', handlerFunction)
    if (toolbar) {
      // Simpan handler asli jika kita perlu mengembalikannya nanti
      if (toolbar.handlers && toolbar.handlers.image) {
        originalHandlerRef.current = toolbar.handlers.image;
      }

      // Gunakan metode addHandler yang direkomendasikan oleh dokumentasi Quill      // Tambahkan handler kustom untuk tombol gambar
      toolbar.addHandler("image", imageHandler);
    }

    // Cleanup
    return () => {
      // Kembalikan handler asli jika ada
      if (toolbar && toolbar.handlers && originalHandlerRef.current) {
        toolbar.handlers.image = originalHandlerRef.current;
      }

      if (imageInputRef.current) {
        imageInputRef.current.removeEventListener("change", handleFileChange);
      }
    };
  }, [quill, uploadImage]);

  return null; // Komponen ini tidak merender apapun
};

export default EditorImageUploader;
