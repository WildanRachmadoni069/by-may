"use client";
import MyEditorArticle from "@/components/editor/MyEditorArticle";
import Quill from "quill";
import React, { useRef, useState } from "react";

// Import Delta class untuk manipulasi konten
const Delta = Quill.import("delta");

function Page() {
  // Buat ref untuk akses ke instance Quill
  const quillRef = useRef<Quill | null>(null);

  // State untuk menyimpan konten editor
  const [content, setContent] = useState<any>(null);

  // State untuk mode readonly
  const [readOnly, setReadOnly] = useState(false);

  // Contoh initial content menggunakan Delta
  const initialContent = new Delta()
    .insert("Selamat Datang di By May\n", { header: 1 })
    .insert("Ini adalah contoh artikel dengan ")
    .insert("formatting", { bold: true, italic: true })
    .insert(" yang bisa digunakan.\n\n")
    .insert("Anda bisa menambahkan gambar, format teks, dll.\n");

  // Handle perubahan konten
  const handleTextChange = (delta: any, oldContents: any, source: string) => {
    console.log("Editor content changed!", delta);
    // Simpan konten terbaru
    setContent(delta);
  };

  // Handle perubahan seleksi
  const handleSelectionChange = (range: any, oldRange: any, source: string) => {
    if (range) {
      console.log("User selection:", range);
    } else {
      console.log("User cursor is not in editor");
    }
  };

  // Fungsi untuk toggle readonly mode
  const toggleReadOnly = () => {
    setReadOnly(!readOnly);
  };

  // Fungsi untuk menambahkan teks bold pada posisi kursor
  const insertBoldText = () => {
    if (quillRef.current) {
      const range = quillRef.current.getSelection();
      if (range) {
        quillRef.current.formatText(range.index, range.length, "bold", true);
      } else {
        // Jika tidak ada seleksi, sisipkan di akhir
        const length = quillRef.current.getLength();
        quillRef.current.insertText(length, "Teks Bold Baru ", { bold: true });
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editor Artikel By May</h1>

      <div className="mb-4 flex gap-2">
        <button
          onClick={toggleReadOnly}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {readOnly ? "Edit Mode" : "Read Only Mode"}
        </button>

        <button
          onClick={insertBoldText}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={readOnly}
        >
          Tambah Teks Bold
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <MyEditorArticle
          ref={quillRef}
          defaultValue={initialContent}
          readOnly={readOnly}
          onTextChange={handleTextChange}
          onSelectionChange={handleSelectionChange}
        />
      </div>

      {content && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Debug - Konten Editor:</h2>
          <pre className="bg-gray-100 p-3 rounded mt-2 overflow-auto max-h-60">
            {JSON.stringify(content, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default Page;
