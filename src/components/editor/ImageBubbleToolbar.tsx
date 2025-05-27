"use client";

import React, { useState, useEffect, useRef } from "react";
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from "lucide-react";
import "./image-bubble-toolbar.css";
import { useEditorImageDelete } from "@/hooks/useEditorImageDelete";
import { toast } from "@/hooks/use-toast";
import DeleteImageDialog from "./DeleteImageDialog";
import { useEditorImageStore } from "@/store/useEditorImageStore";

/**
 * Props untuk komponen ImageBubbleToolbar
 * @interface ImageBubbleToolbarProps
 * @property {any} quill - Instance editor Quill
 * @property {any} selectedImage - Informasi gambar yang dipilih
 * @property {Function} onAlignImage - Callback untuk mengubah perataan gambar
 * @property {Function} onDeleteImage - Callback untuk menghapus gambar
 */
interface ImageBubbleToolbarProps {
  quill: any;
  selectedImage: any;
  onAlignImage: (alignment: string) => void;
  onDeleteImage: () => void;
}

/**
 * Fungsi pembantu untuk mendapatkan perataan gambar saat ini
 * @param {HTMLElement} imgElement - Elemen gambar yang diperiksa
 * @returns {string} - Jenis perataan ('left', 'center', 'right', atau 'justify')
 */
const getCurrentImageAlignment = (imgElement: HTMLElement): string => {
  if (imgElement.classList.contains("ql-align-center")) return "center";
  if (imgElement.classList.contains("ql-align-right")) return "right";
  if (imgElement.classList.contains("ql-align-justify")) return "justify";
  return "left"; // Default alignment
};

/**
 * Komponen toolbar yang muncul di atas gambar yang dipilih
 * Menyediakan kontrol untuk perataan dan penghapusan gambar
 */
const ImageBubbleToolbar: React.FC<ImageBubbleToolbarProps> = ({
  quill,
  selectedImage,
  onAlignImage,
  onDeleteImage,
}) => {
  /** Status visibilitas toolbar */
  const [isVisible, setIsVisible] = useState(false);
  /** Posisi toolbar relatif terhadap gambar */
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  /** Perataan gambar saat ini */
  const [currentAlignment, setCurrentAlignment] = useState<string>("left");
  /** Referensi ke elemen toolbar */
  const toolbarRef = useRef<HTMLDivElement>(null);
  /** Referensi ke timeout untuk menunda perubahan visibilitas */
  const visibilityTimeoutRef = useRef<NodeJS.Timeout>();
  /** Hook untuk fungsi penghapusan gambar */
  const { deleteImageByUrl, isDeleting } = useEditorImageDelete();

  /** Mengambil state dialog dari store global */
  const { isDeleteDialogOpen, openDeleteDialog, closeDeleteDialog } =
    useEditorImageStore();
  /**
   * Menambahkan sedikit penundaan sebelum menampilkan toolbar
   * untuk mencegah toolbar berkedip-kedip
   */ useEffect(() => {
    // Clear timeout jika ada
    if (visibilityTimeoutRef.current) {
      clearTimeout(visibilityTimeoutRef.current);
    }

    // Cek apakah ada gambar yang dipilih
    if (
      selectedImage &&
      selectedImage.element &&
      selectedImage.element.classList.contains("selected-image")
    ) {
      visibilityTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);

        // Mendapatkan perataan gambar saat ini ketika dipilih
        let imgElement: HTMLElement | null = null;
        if (selectedImage.element) {
          imgElement = selectedImage.element;
        } else if (selectedImage.leaf && selectedImage.leaf.domNode) {
          imgElement = selectedImage.leaf.domNode as HTMLElement;
        }

        if (imgElement) {
          const alignment = getCurrentImageAlignment(imgElement);
          setCurrentAlignment(alignment);
        }
      }, 100);
    } else {
      // Jika tidak ada gambar yang dipilih atau highlight hilang, sembunyikan toolbar
      setIsVisible(false);
    }

    return () => {
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }
    };
  }, [selectedImage]);
  /**
   * Memperbarui posisi toolbar saat gambar yang dipilih berubah
   */
  useEffect(() => {
    if (!selectedImage) {
      return;
    }

    // Setel posisi awal
    updatePosition();

    // Perbarui posisi ketika jendela diubah ukurannya atau discroll
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true); // Capture phase for nested scrolling containers

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage, quill, selectedImage?._updated]); // Include _updated timestamp to trigger repositioning
  // This function is called both on initial render and when alignment changes
  const updatePosition = () => {
    if (!selectedImage) {
      return;
    }

    // Gunakan element jika leaf tidak tersedia
    let imgElement: HTMLElement;
    if (selectedImage.element) {
      imgElement = selectedImage.element;
    } else if (selectedImage.leaf && selectedImage.leaf.domNode) {
      imgElement = selectedImage.leaf.domNode as HTMLElement;
    } else {
      console.error("[ImageBubbleToolbar] No valid image element found");
      return;
    }
    try {
      // Gunakan imgElement yang sudah didefinisikan sebelumnya
      const imgRect = imgElement.getBoundingClientRect();

      // Get Quill bounds for accurate positioning
      const bounds = quill.getBounds(selectedImage.index, 2);

      // Get editor container for reference
      const editorContainer = quill.container.querySelector(".ql-editor");
      if (!editorContainer) return;

      const editorRect = editorContainer.getBoundingClientRect();

      // Get toolbar dimensions
      let toolbarHeight = 40; // Default height
      let toolbarWidth = 140; // Default width

      if (toolbarRef.current) {
        const toolbarRect = toolbarRef.current.getBoundingClientRect();
        toolbarHeight = toolbarRect.height || toolbarHeight;
        toolbarWidth = toolbarRect.width || toolbarWidth;
      }

      // Increase vertical gap for better visibility
      const verticalGap = 15;

      // Calculate position above the image
      const newPosition = {
        // Use direct position from getBoundingClientRect for absolute positioning
        top: imgRect.top - toolbarHeight - verticalGap,
        left: imgRect.left + imgRect.width / 2, // Center horizontally
      };

      // If too close to the top, position below the image
      if (newPosition.top < 10) {
        const belowPosition = {
          top: imgRect.bottom + verticalGap,
          left: imgRect.left + imgRect.width / 2,
        };
        setToolbarPosition(belowPosition);
      } else {
        setToolbarPosition(newPosition);
      }
    } catch (error) {
      console.error("[ImageBubbleToolbar] Error updating position:", error);

      // Fallback to quill getBounds
      try {
        const bounds = quill.getBounds(selectedImage.index, 2);

        // Get editor container
        const editorContainer = quill.container.querySelector(".ql-editor");
        const editorRect = editorContainer
          ? editorContainer.getBoundingClientRect()
          : null;

        let toolbarHeight = 40;
        if (toolbarRef.current) {
          toolbarHeight =
            toolbarRef.current.getBoundingClientRect().height || toolbarHeight;
        }

        const verticalGap = 15;

        setToolbarPosition({
          top: bounds.top - verticalGap - toolbarHeight + window.scrollY,
          left: bounds.left + bounds.width / 2,
        });
      } catch (fallbackError) {
        console.error(
          "[ImageBubbleToolbar] Fallback getBounds failed:",
          fallbackError
        );
      }
    }
  };
  /**
   * Menangani klik tombol perataan gambar
   * @param {string} alignment - Jenis perataan ('left', 'center', 'right')
   */
  const handleAlign = (alignment: string) => {
    // Perbarui state lokal untuk menyorot tombol yang benar
    setCurrentAlignment(alignment);
    // Panggil handler dari parent untuk menerapkan perataan
    onAlignImage(alignment);

    // Perbarui posisi toolbar setelah perubahan perataan
    // Gunakan timeout kecil untuk memungkinkan DOM diperbarui dengan gaya perataan baru
    setTimeout(() => {
      updatePosition();
    }, 10);
  };

  /**
   * Handler untuk menampilkan dialog konfirmasi penghapusan gambar
   */
  const handleDeleteClick = () => {
    openDeleteDialog();
  };

  /**
   * Handler untuk menutup dialog tanpa menghapus gambar
   */
  const handleCloseDeleteDialog = () => {
    closeDeleteDialog();
  };
  /**
   * Handler untuk proses penghapusan gambar setelah konfirmasi
   * Menghapus gambar dari Cloudinary jika URL gambar mengandung "cloudinary.com"
   */ const handleConfirmDelete = async () => {
    try {
      // Jika gambar berasal dari Cloudinary, hapus juga dari Cloudinary
      let imgElement: HTMLElement | null = null;
      if (selectedImage) {
        if (selectedImage.element) {
          imgElement = selectedImage.element;
        } else if (selectedImage.leaf && selectedImage.leaf.domNode) {
          imgElement = selectedImage.leaf.domNode as HTMLElement;
        }
      }

      // Jalankan handler delete dari editor terlebih dahulu
      // untuk memastikan isi editor diperbarui
      onDeleteImage();

      // Kemudian lanjutkan dengan penghapusan dari server jika diperlukan
      if (imgElement) {
        const imgUrl = imgElement.getAttribute("src");

        if (imgUrl && imgUrl.includes("cloudinary.com")) {
          // Disable sementara editor untuk menghindari interaksi selama proses
          quill.disable();

          // Hapus gambar dari Cloudinary dengan timeout
          const deletePromise = Promise.race([
            deleteImageByUrl(imgUrl),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("Delete timeout after 10s")),
                10000
              )
            ),
          ]);
          const result = await deletePromise;

          // Verifikasi hasil penghapusan
          if (
            result &&
            (result.success || result.result?.result === "not found")
          ) {
            // Tampilkan notifikasi sukses
            toast({
              title: "Gambar berhasil dihapus",
              description: "Gambar telah dihapus dari server",
            });
          } else {
            throw new Error("Respons penghapusan tidak valid");
          }
        }
      }

      // Tutup dialog dan toolbar
      closeDeleteDialog();
      setIsVisible(false);
    } catch (error) {
      console.error("[ImageBubbleToolbar] Error deleting image:", error);

      // Tampilkan pesan error tapi tetap hapus dari editor
      toast({
        title: "Peringatan",
        description:
          "Gambar dihapus dari artikel namun mungkin masih tersimpan di server",
        variant: "destructive",
      });

      // Tetap jalankan handler delete dari editor meski error di cloudinary
      onDeleteImage();

      // Tutup dialog dan toolbar
      closeDeleteDialog();
      setIsVisible(false);
    } finally {
      // Aktifkan kembali editor
      if (!quill.isEnabled()) {
        quill.enable();
      }
    }
  };

  return (
    <div
      ref={toolbarRef}
      className={`image-bubble-toolbar ${isVisible ? "visible" : ""}`}
      style={{
        top: `${toolbarPosition.top}px`,
        left: `${toolbarPosition.left}px`,
        transform: `translateX(-50%)`, // Center the toolbar
      }}
    >
      {/* Align Left Button */}
      <button
        type="button"
        className={`toolbar-button ${
          currentAlignment === "left" ? "active" : ""
        }`}
        onClick={() => handleAlign("left")}
        title="Align Left"
      >
        <AlignLeft className="toolbar-icon" />
      </button>
      {/* Align Center Button */}
      <button
        type="button"
        className={`toolbar-button ${
          currentAlignment === "center" ? "active" : ""
        }`}
        onClick={() => handleAlign("center")}
        title="Align Center"
      >
        <AlignCenter className="toolbar-icon" />
      </button>
      {/* Align Right Button */}
      <button
        type="button"
        className={`toolbar-button ${
          currentAlignment === "right" ? "active" : ""
        }`}
        onClick={() => handleAlign("right")}
        title="Align Right"
      >
        <AlignRight className="toolbar-icon" />
      </button>
      {/* Separator */}
      <div className="toolbar-separator"></div> {/* Delete Button */}
      <button
        type="button"
        className="toolbar-button delete"
        onClick={handleDeleteClick}
        title="Delete Image"
      >
        <Trash2 className="toolbar-icon" />
      </button>
      {/* Dialog Konfirmasi Delete */}
      <DeleteImageDialog
        isOpen={isDeleteDialogOpen}
        isDeleting={isDeleting}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default ImageBubbleToolbar;
