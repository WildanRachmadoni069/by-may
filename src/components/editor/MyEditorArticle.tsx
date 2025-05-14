"use client";
import Quill from "quill";
import React, { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import "quill/dist/quill.snow.css";
import "./editor-styles.css";
import SimpleImageHandler from "./SimpleImageHandler";
import EditorImageUploadOverlay from "./EditorImageUploadOverlay";
import { useEditorImageStore } from "@/store/useEditorImageStore";

/**
 * Interface untuk properti komponen editor artikel
 * @interface MyEditorArticleProps
 * @property {boolean} [readOnly] - Menentukan apakah editor dalam mode baca saja
 * @property {any} [defaultValue] - Nilai awal yang akan ditampilkan di editor
 * @property {Function} [onTextChange] - Callback yang dipanggil ketika teks berubah
 * @property {Function} [onSelectionChange] - Callback yang dipanggil ketika seleksi berubah
 */
interface MyEditorArticleProps {
  readOnly?: boolean;
  defaultValue?: any;
  onTextChange?: (...args: any[]) => void;
  onSelectionChange?: (...args: any[]) => void;
}

/**
 * Komponen editor artikel menggunakan Quill dengan dukungan untuk mengunggah dan mengelola gambar
 *
 * Komponen ini memungkinkan pengguna untuk menulis dan mengedit artikel dengan
 * kemampuan formatting teks dan penempatan gambar yang fleksibel
 */
const MyEditorArticle = forwardRef<Quill, MyEditorArticleProps>(
  (
    { readOnly = false, defaultValue, onTextChange, onSelectionChange },
    ref
  ) => {
    /** Referensi ke elemen kontainer HTML */
    const containerRef = useRef<HTMLDivElement | null>(null);
    /** Ref untuk menyimpan nilai default agar tidak berubah saat re-render */
    const defaultValueRef = useRef(defaultValue);
    /** Ref untuk menyimpan fungsi callback perubahan teks */
    const onTextChangeRef = useRef(onTextChange);
    /** Ref untuk menyimpan fungsi callback perubahan seleksi */
    const onSelectionChangeRef = useRef(onSelectionChange);
    /** Status unggahan gambar dari store global */
    const { isUploading } = useEditorImageStore();
    /**
     * Memperbarui referensi callback untuk mencegah callback yang tidak diinginkan
     * ketika komponen melakukan re-render
     */
    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    });

    /**
     * Mengaktifkan atau menonaktifkan editor berdasarkan properti readOnly
     */
    useEffect(() => {
      if (ref && typeof ref === "object" && ref.current) {
        ref.current.enable(!readOnly);
      }
    }, [ref, readOnly]);
    /**
     * Inisialisasi editor Quill saat komponen dimuat
     * dan membersihkan editor saat komponen unmount
     */
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      const editorContainer = container.appendChild(
        container.ownerDocument.createElement("div")
      );

      // Konfigurasi Quill dengan toolbar yang lebih lengkap
      const quill = new Quill(editorContainer, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            ["blockquote", "code-block"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"],
          ],
        },
        placeholder: "Mulai menulis konten Anda di sini...",
      });
      /**
       * Menangani forwarded ref dengan tepat berdasarkan jenisnya
       * (bisa fungsi atau objek ref)
       */
      if (ref) {
        if (typeof ref === "function") {
          ref(quill);
        } else {
          ref.current = quill;
        }
      }

      // Menetapkan konten awal jika ada
      if (defaultValueRef.current) {
        quill.setContents(defaultValueRef.current);
      }

      // Memasang event listener untuk perubahan teks
      quill.on(Quill.events.TEXT_CHANGE, (...args) => {
        onTextChangeRef.current?.(...args);
      });

      // Memasang event listener untuk perubahan seleksi
      quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
        onSelectionChangeRef.current?.(...args);
      });
      /**
       * Membersihkan sumber daya saat komponen di-unmount
       */
      return () => {
        // Membersihkan referensi
        if (ref) {
          if (typeof ref === "function") {
            ref(null);
          } else {
            ref.current = null;
          }
        }
        // Membersihkan elemen DOM
        container.innerHTML = "";
      };
    }, [ref]);

    /**
     * Menyimpan instance Quill dalam referensi untuk digunakan oleh SimpleImageHandler
     */
    const quillRef = useRef<Quill | null>(null);
    /**
     * Memperbarui quillRef ketika ref eksternal diperbarui
     * untuk memastikan SimpleImageHandler selalu mendapatkan instance Quill terbaru
     */
    useEffect(() => {
      if (ref && typeof ref === "object" && ref.current) {
        quillRef.current = ref.current;
      }
    }, [ref]);
    return (
      <>
        <div
          ref={containerRef}
          className={`quill-editor-container ${
            readOnly ? "editor-readonly" : ""
          } relative`}
        >
          {/* Overlay yang menampilkan spinner saat unggahan gambar sedang berlangsung */}
          <EditorImageUploadOverlay visible={isUploading} />
        </div>
        {/* 
          Menampilkan SimpleImageHandler hanya jika instance Quill tersedia
          untuk menangani pemilihan dan manipulasi gambar 
        */}
        {quillRef.current && <SimpleImageHandler quill={quillRef.current} />}
      </>
    );
  }
);

// Add display name for better debugging
MyEditorArticle.displayName = "MyEditorArticle";

export default MyEditorArticle;
