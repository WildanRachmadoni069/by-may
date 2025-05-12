"use client";

import React, { useState, useEffect, useRef } from "react";
import "./image-bubble-toolbar.css";

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

    const updatePosition = () => {
      // Gunakan metode getBoundingClientRect untuk posisi yang lebih akurat
      if (selectedImage.leaf && selectedImage.leaf.domNode) {
        try {
          // Dapatkan referensi DOM element gambar
          const imgElement = selectedImage.leaf.domNode;

          // Ambil ukuran dan posisi gambar relatif terhadap viewport
          const imgRect = imgElement.getBoundingClientRect();

          // Ambil container editor untuk koordinat relatif
          const editorContainer = quill.container.querySelector(".ql-editor");
          if (!editorContainer) return;

          // Ambil posisi editor relatif terhadap viewport
          const editorRect = editorContainer.getBoundingClientRect();

          // Dapatkan ukuran toolbar untuk perhitungan yang akurat
          let toolbarHeight = 40; // Default height
          let toolbarWidth = 140; // Default width

          if (toolbarRef.current) {
            const toolbarRect = toolbarRef.current.getBoundingClientRect();
            toolbarHeight = toolbarRect.height || toolbarHeight;
            toolbarWidth = toolbarRect.width || toolbarWidth;
            console.log("[ImageBubbleToolbar] Toolbar dimensions:", {
              toolbarHeight,
              toolbarWidth,
            });
          } // Jarak vertical yang lebih pendek antara toolbar dan gambar
          const verticalGap = 5; // Dikurangi dari 10 menjadi 5px

          // Posisi toolbar di atas gambar menggunakan langsung imgRect
          // Menghitung posisi top: imgRect.top dikurangi tinggi toolbar dan vertical gap
          const newPosition = {
            top: imgRect.top - toolbarHeight - verticalGap, // Langsung posisi di atas gambar dari viewport
            left: imgRect.left + imgRect.width / 2, // Centered horizontally over the image
          };

          console.log(
            "[ImageBubbleToolbar] Setting toolbar position:",
            newPosition,
            "Image rect:",
            imgRect,
            "Editor rect:",
            editorRect
          );

          setToolbarPosition(newPosition); // Jika toolbar akan berada di atas viewport, posisikan di bawah gambar
          if (newPosition.top < 5) {
            const belowPosition = {
              top: imgRect.top + imgRect.height + verticalGap,
              left: imgRect.left + imgRect.width / 2,
            };
            console.log(
              "[ImageBubbleToolbar] Repositioning below image:",
              belowPosition
            );
            setToolbarPosition(belowPosition);
          }
        } catch (error) {
          console.error("[ImageBubbleToolbar] Error updating position:", error);
        }
      } else {
        // Fallback ke quill getBounds jika tidak bisa mendapatkan DOM node
        try {
          const bounds = quill.getBounds(selectedImage.index, 2);
          console.log("[ImageBubbleToolbar] Fallback to getBounds:", bounds);

          let toolbarHeight = 40;
          if (toolbarRef.current) {
            toolbarHeight =
              toolbarRef.current.getBoundingClientRect().height ||
              toolbarHeight;
          }

          const verticalGap = 5;
          setToolbarPosition({
            top: bounds.top - verticalGap - toolbarHeight,
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

    // Set position initially
    updatePosition();

    // Update position when window resizes
    window.addEventListener("resize", updatePosition);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener("resize", updatePosition);
    };
  }, [selectedImage, quill]);

  // Handle button clicks
  const handleAlign = (alignment: string) => {
    console.log(`[ImageBubbleToolbar] Align clicked: ${alignment}`);
    // Update local state to highlight correct button
    setCurrentAlignment(alignment);
    // Call parent handler to actually apply the alignment
    onAlignImage(alignment);
  };

  const handleDelete = () => {
    console.log("[ImageBubbleToolbar] Delete clicked");
    onDeleteImage();
    setIsVisible(false);
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
        <svg
          className="toolbar-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="12" y2="12"></line>
          <line x1="3" y1="18" x2="18" y2="18"></line>
        </svg>
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
        <svg
          className="toolbar-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="6" y1="12" x2="18" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
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
        <svg
          className="toolbar-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="12" y1="12" x2="21" y2="12"></line>
          <line x1="6" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Separator */}
      <div className="toolbar-separator"></div>

      {/* Delete Button */}
      <button
        type="button"
        className="toolbar-button delete"
        onClick={handleDelete}
        title="Delete Image"
      >
        <svg
          className="toolbar-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </div>
  );
};

export default ImageBubbleToolbar;
