"use client";
import MyEditorArticle from "@/components/editor/MyEditorArticle";
import Quill from "quill";
import React, { useRef, useState } from "react";
import { CloudinaryService } from "@/lib/services/cloudinary-service";

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
  // CloudinaryService sudah diimpor di atas
  // State untuk menyimpan URL yang akan diuji
  const [testUrl, setTestUrl] = useState<string>(
    "https://res.cloudinary.com/dba8iejyl/image/upload/v1747219026/article_content/1747219023604_user_1.png"
  );

  // State untuk URL yang diharapkan (untuk perbandingan)
  const [expectedId, setExpectedId] = useState<string>(
    "article_content/1747219023604_user_1"
  );

  // State untuk menyimpan hasil ekstraksi public ID
  const [extractResult, setExtractResult] = useState<{
    url: string;
    publicId: string | null;
    expectedId: string;
  } | null>(null);
  // Fungsi untuk test ekstraksi public ID dari URL Cloudinary
  const testExtractPublicId = () => {
    // URL yang akan diuji
    const urlToTest =
      testUrl ||
      "https://res.cloudinary.com/dba8iejyl/image/upload/v1747219026/article_content/1747219023604_user_1.png";

    const extractedId = CloudinaryService.extractPublicIdFromUrl(urlToTest);

    setExtractResult({
      url: urlToTest,
      publicId: extractedId,
      expectedId: expectedId,
    });

    console.log("URL:", urlToTest);
    console.log("Extracted Public ID:", extractedId);
    console.log("Expected Public ID:", expectedId);
    console.log("Match:", extractedId === expectedId);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editor Artikel By May</h1>{" "}
      <div className="mb-4 space-y-3">
        <div className="flex gap-2">
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

        <div className="p-4 border rounded bg-gray-50">
          <h3 className="font-bold text-lg mb-2">Debug Ekstraksi Public ID</h3>
          <div className="mb-3">
            <label htmlFor="cloudinaryUrl" className="block font-medium mb-1">
              URL Cloudinary untuk diuji:
            </label>
            <div className="flex gap-2">
              <input
                id="cloudinaryUrl"
                type="text"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="flex-1 border rounded px-3 py-2 text-sm"
                placeholder="Masukkan URL Cloudinary..."
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="expectedId" className="block font-medium mb-1">
              Expected Public ID:
            </label>
            <div className="flex gap-2">
              <input
                id="expectedId"
                type="text"
                value={expectedId}
                onChange={(e) => setExpectedId(e.target.value)}
                className="flex-1 border rounded px-3 py-2 text-sm"
                placeholder="Public ID yang diharapkan..."
              />
              <button
                onClick={testExtractPublicId}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Test URL Extract
              </button>
            </div>
          </div>

          {/* Tampilkan hasil ekstraksi public ID jika ada */}
          {extractResult && (
            <div className="mt-2 border-t pt-3">
              <p>
                <span className="font-semibold">URL:</span> {extractResult.url}
              </p>
              <p>
                <span className="font-semibold">Extracted Public ID:</span>{" "}
                {extractResult.publicId || "Tidak berhasil mengekstrak ID"}
              </p>
              <p>
                <span className="font-semibold">Expected:</span>{" "}
                {extractResult.expectedId}
              </p>
              <p
                className={
                  extractResult.publicId === extractResult.expectedId
                    ? "text-green-600 font-bold"
                    : "text-red-600 font-bold"
                }
              >
                Match:{" "}
                {extractResult.publicId === extractResult.expectedId
                  ? "✅ Ya"
                  : "❌ Tidak"}
              </p>
            </div>
          )}
        </div>
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
