"use client";

import { useEditorImageUpload } from "@/hooks/useEditorImageUpload";
import { useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { useEditorImageStore } from "@/store/useEditorImageStore";
import type Quill from "quill";

interface EditorImageUploaderProps {
  quill: Quill;
}

// Fungsi untuk membuat image input yang tersembunyi
const createHiddenImageInput = (): HTMLInputElement => {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/png, image/gif, image/jpeg");
  input.style.display = "none";
  return input;
};

const EditorImageUploader: React.FC<EditorImageUploaderProps> = ({ quill }) => {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const { uploadImage } = useEditorImageUpload();
  const { setUploading } = useEditorImageStore();
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
        console.log(
          "[EditorImageUploader] Uploading image to Cloudinary...",
          file.name,
          file.type
        );

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
        ]);

        const result = await uploadPromise;
        console.log(
          "[EditorImageUploader] Upload success, URL:",
          result.secure_url
        );

        // Sisipkan gambar yang sudah diupload
        console.log(
          "[EditorImageUploader] Inserting Cloudinary image at index:",
          range.index
        );
        quill.insertEmbed(range.index, "image", result.secure_url);
        console.log("[EditorImageUploader] Image embedded successfully");

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
    // Definisikan custom handler untuk gambar
    function imageHandler() {
      console.log("[EditorImageUploader] Custom image handler executed");
      // Klik input file tersembunyi saat tombol image di toolbar diklik
      if (imageInputRef.current) {
        console.log("[EditorImageUploader] Triggering file input click");
        imageInputRef.current.click();
      } else {
        console.log("[EditorImageUploader] Error: File input not available");
      }
    }

    // Tambahkan custom handler ke toolbar
    // Sesuai dokumentasi: toolbar.addHandler('image', handlerFunction)
    if (toolbar) {
      // Simpan handler asli jika kita perlu mengembalikannya nanti
      if (toolbar.handlers && toolbar.handlers.image) {
        originalHandlerRef.current = toolbar.handlers.image;
      }

      // Gunakan metode addHandler yang direkomendasikan oleh dokumentasi Quill
      toolbar.addHandler("image", imageHandler);

      console.log(
        "[EditorImageUploader] Custom image handler added to toolbar"
      );
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
