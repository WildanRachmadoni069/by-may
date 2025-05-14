"use client";

import React, { useState, useEffect, useRef } from "react";
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from "lucide-react";
import "./image-bubble-toolbar.css";
import { useEditorImageDelete } from "@/hooks/useEditorImageDelete";
import { toast } from "@/hooks/use-toast";
import DeleteImageDialog from "./DeleteImageDialog";

interface ImageBubbleToolbarProps {
  quill: any;
  selectedImage: any;
  onAlignImage: (alignment: string) => void;
  onDeleteImage: () => void;
}

// Helper function to get current alignment of an image
const getCurrentImageAlignment = (imgElement: HTMLElement): string => {
  if (imgElement.classList.contains("ql-align-center")) return "center";
  if (imgElement.classList.contains("ql-align-right")) return "right";
  if (imgElement.classList.contains("ql-align-justify")) return "justify";
  return "left"; // Default alignment
};

const ImageBubbleToolbar: React.FC<ImageBubbleToolbarProps> = ({
  quill,
  selectedImage,
  onAlignImage,
  onDeleteImage,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [currentAlignment, setCurrentAlignment] = useState<string>("left");
  const toolbarRef = useRef<HTMLDivElement>(null);
  const visibilityTimeoutRef = useRef<NodeJS.Timeout>();
  const { deleteImageByUrl, isDeleting } = useEditorImageDelete();

  // State untuk dialog konfirmasi hapus
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Add slight delay before showing toolbar to prevent flickering
  useEffect(() => {
    console.log(
      "[ImageBubbleToolbar] Selected image state changed:",
      selectedImage ? "has image" : "no image"
    );

    if (selectedImage) {
      visibilityTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        console.log("[ImageBubbleToolbar] Setting toolbar visible");

        // Get current image alignment when selected
        if (selectedImage.leaf && selectedImage.leaf.domNode) {
          const alignment = getCurrentImageAlignment(
            selectedImage.leaf.domNode
          );
          setCurrentAlignment(alignment);
          console.log("[ImageBubbleToolbar] Current alignment:", alignment);
        }
      }, 100);
    } else {
      clearTimeout(visibilityTimeoutRef.current);
      setIsVisible(false);
      console.log("[ImageBubbleToolbar] Hiding toolbar");
    }

    return () => {
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }
    };
  }, [selectedImage]);

  // Update toolbar position when selected image changes
  useEffect(() => {
    if (!selectedImage) {
      return;
    }

    console.log("[ImageBubbleToolbar] Updating position for selected image");

    // Set position initially
    updatePosition();

    // Update position when window resizes or scrolls
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
    if (!selectedImage || !selectedImage.leaf || !selectedImage.leaf.domNode) {
      return;
    }

    try {
      // Get the image element
      const imgElement = selectedImage.leaf.domNode;
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
        console.log(
          "[ImageBubbleToolbar] Positioned below image:",
          belowPosition
        );
      } else {
        setToolbarPosition(newPosition);
        console.log(
          "[ImageBubbleToolbar] Positioned above image:",
          newPosition
        );
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

  // Handle button clicks
  const handleAlign = (alignment: string) => {
    console.log(`[ImageBubbleToolbar] Align clicked: ${alignment}`);
    // Update local state to highlight correct button
    setCurrentAlignment(alignment);
    // Call parent handler to actually apply the alignment
    onAlignImage(alignment);

    // Update the toolbar position after alignment changes
    // Use a small timeout to allow the DOM to update with new alignment styles
    setTimeout(() => {
      updatePosition();
    }, 10);
  }; // Handler untuk menampilkan dialog konfirmasi hapus
  const handleDeleteClick = () => {
    console.log(
      "[ImageBubbleToolbar] Delete button clicked, showing confirmation dialog"
    );
    setIsDeleteDialogOpen(true);
  };

  // Handler untuk menutup dialog tanpa menghapus
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  // Handler untuk proses penghapusan setelah konfirmasi
  const handleConfirmDelete = async () => {
    console.log("[ImageBubbleToolbar] Delete confirmed");

    try {
      // Jika gambar berasal dari Cloudinary, hapus juga dari Cloudinary
      if (selectedImage && selectedImage.leaf && selectedImage.leaf.domNode) {
        const imgElement = selectedImage.leaf.domNode;
        const imgUrl = imgElement.getAttribute("src");

        if (imgUrl && imgUrl.includes("cloudinary.com")) {
          console.log(
            "[ImageBubbleToolbar] Deleting Cloudinary image:",
            imgUrl
          );

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

          console.log("[ImageBubbleToolbar] Delete result:", result);

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

      // Tetap jalankan handler delete dari editor
      onDeleteImage();

      // Tutup dialog dan toolbar
      setIsDeleteDialogOpen(false);
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
      setIsDeleteDialogOpen(false);
      setIsVisible(false);
    } finally {
      // Aktifkan kembali editor
      if (!quill.isEnabled()) {
        quill.enable();
      }
    }
  };

  console.log("[ImageBubbleToolbar] Rendering toolbar, isVisible:", isVisible);

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
