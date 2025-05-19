"use client";
import Quill from "quill";
import React, {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import "quill/dist/quill.snow.css";
import "./editor-styles.css";
import "./image-bubble-toolbar.css";
import ImageBubbleToolbar from "./ImageBubbleToolbar";
import DeleteImageDialog from "./DeleteImageDialog";
import EditorImageUploadOverlay from "./EditorImageUploadOverlay";
import { useEditorImageStore } from "@/store/useEditorImageStore";
import { useEditorImageUpload } from "@/hooks/useEditorImageUpload";
import { useEditorImageDelete } from "@/hooks/useEditorImageDelete";
import { useToast } from "@/hooks/use-toast";

/**
 * Interface untuk menyimpan informasi gambar yang sedang dipilih
 * @interface SelectedImageInfo
 * @property {number} index - Posisi gambar dalam dokumen
 * @property {HTMLElement} element - Elemen DOM dari gambar
 * @property {any} info - Informasi tambahan tentang gambar
 * @property {any} [leaf] - Leaf node dari Quill yang berisi gambar
 * @property {Node} [domNode] - DOM node dari gambar
 * @property {number} [_updated] - Timestamp untuk memaksa komponen melakukan update
 */
interface SelectedImageInfo {
  index: number;
  element: HTMLElement;
  info: any;
  leaf?: any;
  domNode?: Node;
  _updated?: number;
}

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
    // Referensi dan State
    const containerRef = useRef<HTMLDivElement | null>(null);
    const quillRef = useRef<Quill | null>(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);
    const [selectedImage, setSelectedImage] =
      useState<SelectedImageInfo | null>(null);

    // Toast hook
    const { toast: showToast } = useToast();

    // Hooks untuk upload dan delete gambar
    const { uploadImage } = useEditorImageUpload();
    const { deleteImageByUrl } = useEditorImageDelete();
    const {
      isUploading,
      setUploading,
      setSelectedImage: setGlobalSelectedImage,
      isDeleteDialogOpen,
      openDeleteDialog,
      closeDeleteDialog,
    } = useEditorImageStore();

    // Memperbarui referensi callback untuk mencegah callback yang tidak diinginkan
    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    });

    // Mengaktifkan atau menonaktifkan editor berdasarkan properti readOnly
    useEffect(() => {
      if (quillRef.current) {
        quillRef.current.enable(!readOnly);
      }
    }, [readOnly]); // Mengatur konten editor hanya saat komponen dimount atau setelah quill diinisialisasi
    useEffect(() => {
      if (
        quillRef.current &&
        defaultValue &&
        typeof defaultValue === "string"
      ) {
        // Pastikan editor sudah diinisialisasi dan defaultValue adalah string
        if (defaultValue.trim() !== "") {
          // Hanya atur konten jika defaultValue tidak kosong
          quillRef.current.root.innerHTML = defaultValue;
        }
      }
      // Hapus defaultValue dari dependensi agar tidak dijalankan setiap kali defaultValue berubah
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Menangani proses penghapusan gambar dari editor
     */
    const handleDeleteImage = async () => {
      if (!selectedImage || !quillRef.current) return;

      try {
        // Catat URL gambar sebelum dihapus
        const imgSrc = selectedImage.element.getAttribute("src");

        // Clear selection dan highlight sebelum hapus
        const imgElement = selectedImage.element;
        if (imgElement) {
          imgElement.style.border = "";
          imgElement.style.borderRadius = "";
          imgElement.style.boxShadow = "";
          imgElement.classList.remove("selected-image");
        }

        // Bersihkan state
        const indexToDelete = selectedImage.index;

        // Hapus gambar dari editor dengan API source untuk melewati perlindungan
        quillRef.current.deleteText(indexToDelete, 1, "api");

        // Bersihkan state setelah penghapusan
        setSelectedImage(null);
        setGlobalSelectedImage(null);

        // Kembalikan fokus ke editor pada posisi yang sama
        setTimeout(() => {
          quillRef.current?.focus();
          quillRef.current?.setSelection(indexToDelete, 0);

          // Tampilkan toast sukses hapus
          try {
            showToast({
              title: "Gambar berhasil dihapus",
              description: "Gambar telah dihapus dari artikel",
              variant: "default",
            });
          } catch (e) {
            // Error handling untuk toast
          }
        }, 100);

        // Hapus gambar dari storage jika ada URL
        if (imgSrc) {
          try {
            await deleteImageByUrl(imgSrc);
            // Toast notification is handled by the first call
          } catch (error) {
            // Notifikasi kesalahan jika gagal hapus dari storage
            showToast({
              title: "Gambar dihapus dari artikel",
              description: "Tetapi gagal menghapus dari server penyimpanan",
              variant: "destructive",
              duration: 5000,
            });
          }
        }
      } catch (error) {
        showToast({
          title: "Gagal menghapus gambar",
          description: "Terjadi kesalahan saat menghapus gambar",
          variant: "destructive",
          duration: 5000,
        });
      }
    };
    /**
     * Menangani proses pengaturan alignment gambar
     * @param alignment - Jenis alignment: left, center, right
     */
    const handleAlignImage = (alignment: string) => {
      if (!selectedImage || !selectedImage.element) return;

      const img = selectedImage.element;
      const index = selectedImage.index;

      if (!quillRef.current) return;

      // Simpan state sementara
      const wasSelected = img.classList.contains("selected-image");

      // Remove existing alignment classes
      img.classList.remove(
        "ql-align-left",
        "ql-align-center",
        "ql-align-right"
      );
      img.style.float = "";
      img.style.marginLeft = "";
      img.style.marginRight = "";
      img.style.display = "";

      // Apply new alignment
      if (alignment === "center") {
        img.classList.add("ql-align-center");
        img.style.display = "block";
        img.style.float = "none";
        img.style.marginLeft = "auto";
        img.style.marginRight = "auto";
      } else if (alignment === "right") {
        img.classList.add("ql-align-right");
        img.style.float = "right";
        img.style.marginLeft = "1em";
        img.style.marginBottom = "1em";
      } else if (alignment === "left") {
        img.classList.add("ql-align-left");
        img.style.float = "left";
        img.style.marginRight = "1em";
        img.style.marginBottom = "1em";
      }

      // Set class dan highlight jika masih terpilih
      if (wasSelected) {
        img.classList.add("selected-image");
        img.style.border = "2px solid #3b82f6";
        img.style.borderRadius = "4px";
        img.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)";
      }

      // Force refresh untuk memastikan perubahan terlihat
      if (quillRef.current) {
        // Teknik untuk memaksa Quill memperbarui formatnya
        quillRef.current.updateContents(
          [{ retain: index, attributes: { align: alignment } }],
          "api"
        );

        // Perbaharui state untuk trigger re-render dan mempertahankan highlight
        setSelectedImage({
          ...selectedImage,
          element: img, // Update dengan elemen yang sudah dimodifikasi
          _updated: Date.now(),
        });

        // Pastikan editor tetap fokus dan gambar tetap terpilih
        setTimeout(() => {
          quillRef.current?.setSelection(index, 1);
        }, 10);
      }
    }; // Inisialisasi editor dan handler-nya
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      // Clear container
      container.innerHTML = "";

      // Create Quill container
      const editorContainer = document.createElement("div");
      container.appendChild(editorContainer);

      // Create file input for image uploads
      const fileInput = document.createElement("input");
      fileInput.setAttribute("type", "file");
      fileInput.setAttribute("accept", "image/png, image/jpeg, image/gif");
      fileInput.style.display = "none";
      document.body.appendChild(fileInput); // Initialize Quill
      const quill = new Quill(editorContainer, {
        theme: "snow",
        modules: {
          toolbar: {
            container: [
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ color: [] }, { background: [] }],
              [{ align: [] }],
              ["blockquote", "code-block"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["link", "image"],
              ["clean"],
            ],
            // Handlers akan ditambahkan setelah inisialisasi
          },
          keyboard: {
            bindings: {
              enter: {
                key: 13,
                handler: function (range: any, context: any) {
                  // Perilaku default untuk Enter
                  return true;
                },
              },
            },
          },
        },
        placeholder: "Mulai menulis konten Anda di sini...",
      }); // Store Quill instance
      quillRef.current = quill;

      // Set initial content if available
      if (
        defaultValueRef.current &&
        typeof defaultValueRef.current === "string" &&
        defaultValueRef.current.trim() !== ""
      ) {
        quill.root.innerHTML = defaultValueRef.current;
      }

      // Forward ref
      if (ref) {
        if (typeof ref === "function") {
          ref(quill);
        } else {
          ref.current = quill;
        }
      }
      /**
       * Memeriksa apakah sebuah node adalah gambar
       * @param leafAny - Node yang akan diperiksa
       * @returns Boolean yang menunjukkan apakah node tersebut adalah gambar
       */
      const isLeafNodeImage = (leafAny: any): boolean => {
        if (!leafAny) return false;
        const hasEmbed = !!(leafAny as any).embed;
        const isImage = hasEmbed && !!(leafAny as any).embed?.image;
        const hasDomNode = !!(leafAny as any).domNode;
        const isDomNodeImage =
          hasDomNode && (leafAny as any).domNode?.tagName === "IMG";
        return isImage || isDomNodeImage;
      };
      /**
       * Memeriksa apakah ada gambar pada posisi tertentu dalam dokumen
       * @param index - Posisi yang akan diperiksa dalam dokumen
       * @returns Objek yang berisi status isImage dan informasi gambar
       */
      const checkForImageAt = (
        index: number
      ): { isImage: boolean; imgInfo: any } => {
        try {
          const leafResult = quill.getLeaf(index);
          if (!leafResult || !leafResult.length)
            return { isImage: false, imgInfo: null };

          const leaf = leafResult[0];
          if (!leaf) return { isImage: false, imgInfo: null };

          const isImage = isLeafNodeImage(leaf);

          return {
            isImage,
            imgInfo: isImage
              ? {
                  index,
                  leaf,
                  src:
                    (leaf as any).embed?.image ||
                    ((leaf as any).domNode as HTMLElement)?.getAttribute?.(
                      "src"
                    ),
                }
              : null,
          };
        } catch (error) {
          // Error handling saat memeriksa gambar
          return { isImage: false, imgInfo: null };
        }
      };
      /**
       * Memberikan atau menghapus highlight pada gambar yang dipilih
       * @param imgInfo - Informasi gambar yang akan di-highlight
       * @param highlight - Boolean yang menentukan apakah gambar harus di-highlight atau tidak
       */
      const highlightImage = (imgInfo: any, highlight: boolean = true) => {
        try {
          if (!imgInfo || !imgInfo.leaf) {
            return;
          }

          const imgElement = (imgInfo.leaf as any).domNode as HTMLElement;
          if (!imgElement) {
            return;
          }

          if (highlight) {
            imgElement.style.border = "2px solid #3b82f6";
            imgElement.style.borderRadius = "4px";
            imgElement.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)";
            imgElement.classList.add("selected-image");
          } else {
            imgElement.style.border = "";
            imgElement.style.borderRadius = "";
            imgElement.style.boxShadow = "";
            imgElement.classList.remove("selected-image");
          }
        } catch (error) {
          // Error handling jika terjadi kesalahan saat highlight
        }
      };
      /**
       * Menangani klik pada gambar untuk melakukan seleksi
       * @param e - Event mouse yang terjadi
       */
      const handleImageClick = (e: MouseEvent) => {
        // Verifikasi target adalah gambar
        if (e.target && (e.target as HTMLElement).tagName === "IMG") {
          const imgElement = e.target as HTMLElement;

          // Cari index dari gambar ini di editor
          let foundIndex = -1;
          const totalLength = quill.getLength();

          // Scan through the document to find this image
          for (let i = 0; i < totalLength; i++) {
            const { isImage, imgInfo } = checkForImageAt(i);
            if (isImage && imgInfo && imgInfo.leaf) {
              const checkImgElement = (imgInfo.leaf as any).domNode;
              if (checkImgElement === imgElement) {
                foundIndex = i;
                break;
              }
            }
          }

          // Jika ketemu gambar, langsung seleksi
          if (foundIndex !== -1) {
            // Batalkan peristiwa default sehingga tidak muncul menu klik kanan
            e.preventDefault();
            e.stopPropagation();

            // Set selection di Quill ke gambar ini
            quill.setSelection(foundIndex, 1);
          }
        }
      };
      /**
       * Mencegah gambar diganti dengan input karakter
       * @param e - Event keyboard yang terjadi
       */
      const preventImageReplacement = (e: KeyboardEvent) => {
        // Skip tombol modifier yang mungkin shortcut
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        // Skip navigasi dan tombol fungsi
        if (
          e.key.startsWith("Arrow") ||
          e.key === "Shift" ||
          e.key === "Control" ||
          e.key === "Alt" ||
          e.key === "Meta" ||
          e.key === "Escape" ||
          e.key === "Tab" ||
          (e.key.startsWith("F") && e.key.length > 1)
        ) {
          return;
        }

        const range = quill.getSelection();
        if (!range) return;

        const { isImage } = checkForImageAt(range.index);

        if (isImage) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      };
      /**
       * Gambar yang sedang di-highlight saat ini
       */
      let currentlyHighlighted: any = null;

      /**
       * Menangani perubahan seleksi untuk mendeteksi gambar
       * @param range - Range seleksi yang berubah
       */
      const handleSelectionChange = (range: any) => {
        // Saat tidak ada range atau quill, reset semua state
        if (!range || !quill) {
          if (currentlyHighlighted) {
            highlightImage(currentlyHighlighted, false);
            currentlyHighlighted = null;
          }
          setSelectedImage(null);
          setGlobalSelectedImage(null);
          return;
        }

        // Jika seleksi berubah, cek apakah ada gambar pada posisi kursor
        const { isImage, imgInfo } = checkForImageAt(range.index);

        // Jika tidak ada gambar yang dipilih, hapus highlight yang ada
        if (!isImage || !imgInfo) {
          if (currentlyHighlighted) {
            highlightImage(currentlyHighlighted, false);
            currentlyHighlighted = null;
            setSelectedImage(null);
            setGlobalSelectedImage(null);
          }
          return;
        }

        // Sudah mendeteksi gambar, langsung highlight dan update state
        if (isImage && imgInfo && imgInfo.leaf) {
          const imgElement = (imgInfo.leaf as any).domNode as HTMLElement;
          if (!imgElement) {
            return;
          }

          // Highlight gambar
          highlightImage(imgInfo, true);
          currentlyHighlighted = imgInfo;

          // Update DOM dan state secara langsung
          setSelectedImage({
            index: range.index,
            element: imgElement,
            info: imgInfo,
            leaf: imgInfo.leaf,
          });

          // Set in global store juga
          setGlobalSelectedImage({
            index: range.index,
            src: imgElement.getAttribute("src"),
          });
        }
      };
      /**
       * Memeriksa apakah range teks mengandung gambar
       * @param index - Posisi awal dalam dokumen
       * @param length - Panjang range yang diperiksa
       * @returns Boolean yang menunjukkan apakah range mengandung gambar
       */
      const rangeContainsImage = (index: number, length: number): boolean => {
        if (length <= 0) return false;

        // Periksa setiap posisi dalam range
        for (let i = index; i < index + length; i++) {
          const { isImage } = checkForImageAt(i);
          if (isImage) return true;
        }
        return false;
      };

      /**
       * Override fungsi deleteText Quill untuk mencegah penghapusan gambar
       * tanpa konfirmasi
       */
      const originalDeleteText = quill.deleteText.bind(quill);
      const safeDeleteText = function (
        index: number,
        length: number,
        source?: any
      ): void {
        // Izinkan penghapusan jika sumbernya adalah api (penghapusan terprogram)
        if (source === "api") {
          originalDeleteText(index, length, source);
          return;
        }

        // Cegah penghapusan jika mengandung gambar
        if (rangeContainsImage(index, length)) {
          return;
        }

        // Jika bukan menghapus gambar, lanjutkan
        originalDeleteText(index, length, source);
      };

      // Ganti method deleteText Quill
      (quill as any).deleteText = safeDeleteText;
      /**
       * Menangani penekanan tombol Backspace dan Delete saat mengoperasikan gambar
       * @param e - Event keyboard yang terjadi
       */
      const handleImageDeleteKeypress = (e: KeyboardEvent) => {
        if (e.key !== "Backspace" && e.key !== "Delete") return;

        const range = quill.getSelection();
        if (!range) return;

        // Cari gambar di beberapa posisi berdasarkan tombol yang ditekan
        let imageDetected = false;
        let imageIndex = -1;
        let imgInfo = null;

        // Untuk Backspace key
        if (!imageDetected && e.key === "Backspace" && range.index > 0) {
          const result = checkForImageAt(range.index - 1);
          if (result.isImage) {
            imageDetected = true;
            imageIndex = range.index - 1;
            imgInfo = result.imgInfo;
          }
        }

        // Untuk Delete key
        if (!imageDetected && e.key === "Delete") {
          const result = checkForImageAt(range.index);
          if (result.isImage) {
            imageDetected = true;
            imageIndex = range.index;
            imgInfo = result.imgInfo;
          }

          // Cek posisi berikutnya
          if (!imageDetected) {
            const nextResult = checkForImageAt(range.index + 1);
            if (nextResult.isImage) {
              imageDetected = true;
              imageIndex = range.index + 1;
              imgInfo = nextResult.imgInfo;
            }
          }
        }

        // Jika menemukan gambar, tunjukkan konfirmasi delete
        if (imageDetected && imgInfo) {
          const imgElement = (imgInfo.leaf as any).domNode as HTMLElement;

          if (imgElement) {
            // Pilih gambar terlebih dahulu
            quill.setSelection(imageIndex, 1);

            // Update state gambar yang dipilih dengan leaf untuk digunakan di toolbar
            // Gunakan setTimeout untuk memastikan pemilihan gambar terjadi setelah event loop selesai
            setTimeout(() => {
              setSelectedImage({
                index: imageIndex,
                element: imgElement,
                info: imgInfo,
                leaf: imgInfo.leaf,
              });
            }, 0); // Konfirmasi menghapus gambar menggunakan dialog kustom
            openDeleteDialog();

            // Mencegah perilaku keyboard default
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        }
      };
      /**
       * Menangani navigasi keyboard dan mencegah penggantian gambar
       * @param e - Event keyboard yang terjadi
       */
      const handleKeyDown = (e: KeyboardEvent) => {
        const range = quill.getSelection();
        if (!range) return;

        // Cek untuk navigasi dengan arrow key
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          const nextIndex = range.index + (e.key === "ArrowRight" ? 1 : -1);
          if (nextIndex < 0 || nextIndex >= quill.getLength()) return;

          const { isImage } = checkForImageAt(nextIndex);
          if (isImage) {
            quill.setSelection(nextIndex, 0);
            e.preventDefault();
          }
        }
      };

      // File input change handler untuk upload gambar
      fileInput.addEventListener("change", async () => {
        if (!fileInput.files || !fileInput.files.length || !quillRef.current)
          return;

        const file = fileInput.files[0];

        // Validate file
        if (!file.type.startsWith("image/")) {
          showToast({
            title: "Format file tidak didukung",
            description: "Silakan pilih file gambar (JPEG, PNG, GIF)",
            variant: "destructive",
          });
          return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          showToast({
            title: "Ukuran file terlalu besar",
            description: "Ukuran gambar maksimal adalah 5MB",
            variant: "destructive",
          });
          return;
        }

        // Get current selection
        const range = quillRef.current.getSelection(true);

        // Store enabled state to restore later
        const wasEnabled = quill.isEnabled();
        quill.disable();

        // Show loading state
        setUploading(true);

        try {
          // Upload image dengan timeout
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

          // Sisipkan gambar ke editor
          quillRef.current.insertEmbed(range.index, "image", result.secure_url);

          // Tambahkan baris baru setelah gambar untuk mempermudah penambahan konten selanjutnya
          quillRef.current.insertText(range.index + 1, "\n");

          // Pindahkan kursor setelah baris baru dan fokuskan editor
          quillRef.current.setSelection(range.index + 2, 0);

          // Memastikan editor mendapatkan fokus yang tepat setelah penambahan gambar
          setTimeout(() => {
            quillRef.current?.focus();
            quillRef.current?.setSelection(range.index + 2, 0);
          }, 50);

          // Tampilkan toast sukses setelah upload gambar
          setTimeout(() => {
            showToast({
              title: "Gambar berhasil diupload",
              description: "Gambar telah ditambahkan ke artikel",
              variant: "default",
            });
          }, 100);
        } catch (error) {
          showToast({
            title: "Gagal mengunggah gambar",
            description:
              error instanceof Error
                ? error.message
                : "Terjadi kesalahan saat mengunggah gambar",
            variant: "destructive",
          });
        } finally {
          setUploading(false);
          fileInput.value = ""; // Clear input

          // Restore enabled state
          if (wasEnabled) {
            quill.enable();
          }
        }
      });
      /**
       * Handler untuk tombol image pada toolbar
       */
      const imageHandler = () => {
        fileInput.click();
      };

      // Tambahkan handler ke toolbar
      const toolbar = quill.getModule("toolbar");
      if (toolbar && typeof (toolbar as any).addHandler === "function") {
        (toolbar as any).addHandler("image", imageHandler);
      }

      // Register event handlers
      quill.on("selection-change", handleSelectionChange);
      quill.on("text-change", (...args) => {
        if (onTextChangeRef.current) onTextChangeRef.current(...args);
      });

      // Tambahkan event listeners untuk klik gambar pada root element editor
      const editorRoot = quill.root;
      editorRoot.addEventListener("click", handleImageClick);
      editorRoot.addEventListener("contextmenu", handleImageClick);

      // Add keyboard event listeners - using capture phase for priorities
      document.addEventListener("keydown", handleImageDeleteKeypress, true);
      document.addEventListener("keydown", preventImageReplacement, true);

      // Add editor's own keyboard handler
      const editorElement = quill.root;
      editorElement.addEventListener("keydown", handleKeyDown); // Cleanup function
      return () => {
        // Clear Quill instance
        quillRef.current = null;

        // Clear forwarded ref
        if (ref) {
          if (typeof ref === "function") {
            ref(null);
          } else {
            ref.current = null;
          }
        }

        // Remove event listeners
        document.removeEventListener(
          "keydown",
          handleImageDeleteKeypress,
          true
        );
        document.removeEventListener("keydown", preventImageReplacement, true);

        if (editorElement) {
          editorElement.removeEventListener("keydown", handleKeyDown);
          // Bersihkan event listener untuk klik gambar
          editorElement.removeEventListener("click", handleImageClick);
          editorElement.removeEventListener("contextmenu", handleImageClick);
        }

        // Remove file input
        if (document.body.contains(fileInput)) {
          document.body.removeChild(fileInput);
        }

        // Restore original deleteText method
        if (originalDeleteText) {
          (quill as any).deleteText = originalDeleteText;
        }

        // Clear container
        container.innerHTML = "";
      };
    }, []);
    return (
      <div className="editor-wrapper">
        <div
          ref={containerRef}
          className={`quill-editor-container ${
            readOnly ? "editor-readonly" : ""
          } relative`}
          style={{ minHeight: "300px" }}
        >
          <EditorImageUploadOverlay visible={isUploading} />
        </div>
        {selectedImage && quillRef.current && (
          <ImageBubbleToolbar
            quill={quillRef.current}
            selectedImage={selectedImage}
            onAlignImage={handleAlignImage}
            onDeleteImage={handleDeleteImage}
          />
        )}
        {selectedImage && (
          <DeleteImageDialog
            isOpen={isDeleteDialogOpen}
            isDeleting={false}
            onClose={closeDeleteDialog}
            onConfirm={() => {
              handleDeleteImage();
              closeDeleteDialog();
            }}
          />
        )}
      </div>
    );
  }
);

MyEditorArticle.displayName = "MyEditorArticle";

export default MyEditorArticle;
