"use client";

import React, { useEffect, useState, useRef } from "react";
import Quill from "quill";
import ImageBubbleToolbar from "./ImageBubbleToolbar";
import EditorImageUploader from "./EditorImageUploader";
import "./image-bubble-toolbar.css";
import { useEditorImageStore } from "@/store/useEditorImageStore";

interface SimpleImageHandlerProps {
  quill: Quill;
}

interface SelectedImageInfo {
  index: number;
  imgElement: HTMLElement;
  imgInfo: any;
  _updated?: number; // Optional timestamp property to force updates
}

/**
 * A simplified component that just handles image selection detection
 * and keyboard navigation to images
 */
const SimpleImageHandler: React.FC<SimpleImageHandlerProps> = ({ quill }) => {
  // Using local state for internal handling
  const [selectedImage, setSelectedImage] = useState<SelectedImageInfo | null>(
    null
  );

  // Using the global store for shared state with other components
  const { setSelectedImage: setGlobalSelectedImage, openDeleteDialog } =
    useEditorImageStore();

  // Flag to track if we're performing intentional image deletion
  const intentionalImageDeletionRef = useRef<boolean>(false);

  // Store key functions in ref to access across renders
  const applyImageAlignmentRef =
    useRef<(imgInfo: any, alignment: string) => void>();
  const quillRef = useRef(quill);

  // Sync local selection state to global store
  useEffect(() => {
    if (selectedImage) {
      setGlobalSelectedImage(selectedImage.imgInfo);
    } else {
      setGlobalSelectedImage(null);
    }
  }, [selectedImage, setGlobalSelectedImage]);

  // Update quill ref whenever prop changes
  useEffect(() => {
    quillRef.current = quill;
    console.log("[SimpleImageHandler] Quill instance updated");
  }, [quill]);

  // Setup alignment function reference - runs only once
  useEffect(() => {
    applyImageAlignmentRef.current = (imgInfo: any, alignment: string) => {
      try {
        if (!imgInfo) return;
        const imgElement = (imgInfo.leaf as any).domNode as HTMLElement;
        if (!imgElement) return;

        // Remove existing alignments
        imgElement.classList.remove(
          "ql-align-left",
          "ql-align-center",
          "ql-align-right",
          "ql-align-justify"
        );
        imgElement.style.float = "";
        imgElement.style.marginLeft = "";
        imgElement.style.marginRight = "";
        imgElement.style.display = "";

        // Apply new alignment
        if (alignment === "center") {
          imgElement.classList.add("ql-align-center");
          imgElement.style.display = "block";
          imgElement.style.float = "none";
          imgElement.style.marginLeft = "auto";
          imgElement.style.marginRight = "auto";
        } else if (alignment === "right") {
          imgElement.classList.add("ql-align-right");
          imgElement.style.float = "right";
          imgElement.style.marginLeft = "1em";
          imgElement.style.marginBottom = "1em";
        } else {
          imgElement.classList.add("ql-align-left");
          imgElement.style.float = "left";
          imgElement.style.marginRight = "1em";
          imgElement.style.marginBottom = "1em";
        }
      } catch (error) {
        console.error("Error applying alignment to image:", error);
      }
    };
  }, []);

  // Handler for aligning images from the bubble toolbar
  const handleAlignImage = (alignment: string) => {
    console.log(
      `[SimpleImageHandler] Align image called with alignment: ${alignment}`
    );

    if (
      selectedImage &&
      selectedImage.imgInfo &&
      applyImageAlignmentRef.current
    ) {
      applyImageAlignmentRef.current(selectedImage.imgInfo, alignment);

      // Force update after alignment
      setTimeout(() => {
        if (selectedImage && selectedImage.imgElement) {
          setSelectedImage({
            ...selectedImage,
            _updated: Date.now(),
          });
        }
      }, 10);
    }
  };

  // Handler for deleting images from the bubble toolbar
  const handleDeleteImage = () => {
    if (selectedImage) {
      console.log("[SimpleImageHandler] Delete image requested", selectedImage);

      try {
        const index = selectedImage.index;

        if (quillRef.current) {
          console.log(`[SimpleImageHandler] Deleting image at index ${index}`);

          // Remove highlighting
          if (selectedImage.imgElement) {
            selectedImage.imgElement.style.border = "";
            selectedImage.imgElement.style.borderRadius = "";
            selectedImage.imgElement.style.boxShadow = "";
            selectedImage.imgElement.classList.remove("ql-image-selected");
          }

          // Set flag to bypass deletion prevention
          intentionalImageDeletionRef.current = true;
          setSelectedImage(null);

          // Delete content with "api" source parameter
          quillRef.current.deleteText(index, 2, "api");

          // Reset flag after deletion
          setTimeout(() => {
            intentionalImageDeletionRef.current = false;
            quillRef.current?.setSelection(index, 0);
          }, 10);
        }
      } catch (error) {
        console.error("[SimpleImageHandler] Error deleting image:", error);
      }
    }
  };

  useEffect(() => {
    if (!quill) return;

    // Helper function to check if a leaf node is an image
    const isLeafNodeImage = (leafAny: any): boolean => {
      if (!leafAny) return false;
      const hasEmbed = !!(leafAny as any).embed;
      const isImage = hasEmbed && !!(leafAny as any).embed?.image;
      const hasDomNode = !!(leafAny as any).domNode;
      const isDomNodeImage =
        hasDomNode && (leafAny as any).domNode?.tagName === "IMG";
      return isImage || isDomNodeImage;
    };

    // Check if there's an image at a specific position
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
                  ((leaf as any).domNode as HTMLElement)?.getAttribute?.("src"),
              }
            : null,
        };
      } catch (error) {
        console.error("Error checking for image:", error);
        return { isImage: false, imgInfo: null };
      }
    };

    // Helper function to add modern border to selected image
    const highlightImage = (imgInfo: any, highlight: boolean = true) => {
      try {
        if (!imgInfo) return;
        const imgElement = (imgInfo.leaf as any).domNode as HTMLElement;
        if (!imgElement) return;

        if (highlight) {
          imgElement.style.border = "2px solid #3b82f6";
          imgElement.style.borderRadius = "4px";
          imgElement.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)";
          imgElement.style.transition = "all 0.2s ease";
          imgElement.classList.add("ql-image-selected");
          imgElement.setAttribute("unselectable", "on");
        } else {
          imgElement.style.border = "";
          imgElement.style.borderRadius = "";
          imgElement.style.boxShadow = "";
          imgElement.style.transition = "";
          imgElement.classList.remove("ql-image-selected");
          imgElement.removeAttribute("unselectable");
        }
      } catch (error) {
        console.error("Error highlighting image:", error);
      }
    };

    // Track the currently highlighted image
    let currentlyHighlighted: any = null;

    // Function to detect image selection
    const handleSelectionChange = (range: any) => {
      if (!range) {
        setSelectedImage(null);
        if (currentlyHighlighted) {
          highlightImage(currentlyHighlighted, false);
          currentlyHighlighted = null;
        }
        return;
      }

      // Clear previous highlighted image
      if (currentlyHighlighted) {
        highlightImage(currentlyHighlighted, false);
        currentlyHighlighted = null;
      }

      setSelectedImage(null);

      // Check if cursor is on an image
      const { isImage, imgInfo } = checkForImageAt(range.index);

      if (isImage) {
        highlightImage(imgInfo, true);
        currentlyHighlighted = imgInfo;

        const imgElement = (imgInfo.leaf as any).domNode as HTMLElement;
        if (imgElement) {
          setSelectedImage({
            index: range.index,
            imgElement: imgElement,
            imgInfo: imgInfo,
          });
        }
      }
    };

    // Function to check if current selection contains an image
    const selectionContainsImage = (): boolean => {
      const range = quill.getSelection();
      if (!range) return false;

      // Check for zero-length selection at image position
      if (range.length === 0) {
        const { isImage } = checkForImageAt(range.index);
        return isImage;
      }

      // Check for selection with length > 0
      for (let i = range.index; i < range.index + range.length; i++) {
        const { isImage } = checkForImageAt(i);
        if (isImage) return true;
      }

      return false;
    };

    // Prevent replacing images with character input
    const preventImageReplacement = (e: KeyboardEvent) => {
      // Skip modifier key combinations that might be shortcuts
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Skip navigation, selection and function keys
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

      // For all other keys (characters, Space, etc), check if an image is selected
      if (selectionContainsImage()) {
        console.log(`[Prevented replacing image with character: ${e.key}]`);
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Handler for paste events
    const preventPasteOnImage = (e: ClipboardEvent) => {
      if (selectionContainsImage()) {
        console.log("[Prevented pasting content over image]");
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Function to check if a range contains any images
    const rangeContainsImage = (index: number, length: number): boolean => {
      if (length <= 0) return false;

      // Check every position in the range
      for (let i = index; i < index + length; i++) {
        const { isImage } = checkForImageAt(i);
        if (isImage) {
          return true;
        }
      }

      return false;
    };

    // Create a safer wrapper for deleteText
    const originalDeleteText = quill.deleteText.bind(quill);
    const safeDeleteText = function (
      index: number,
      length: number,
      source?: any
    ): void {
      // Allow deletion if source is "api" (programmatic deletion)
      if (source === "api") {
        originalDeleteText(index, length, source);
        return;
      }

      // Otherwise prevent image deletion
      if (rangeContainsImage(index, length)) {
        return;
      }

      // If not deleting an image, proceed with the original deletion
      originalDeleteText(index, length, source);
    };

    // Replace Quill's deleteText method
    (quill as any).deleteText = safeDeleteText;

    // Create wrapper for insertText
    const originalInsertText = quill.insertText.bind(quill);
    const safeInsertText = function (
      index: number,
      text: string,
      source?: any
    ): void {
      // Allow normal insertion if not at image position
      const { isImage } = checkForImageAt(index);
      if (!isImage) {
        originalInsertText(index, text, source);
      }
    };

    // Replace Quill's insertText method
    (quill as any).insertText = safeInsertText;

    // Key function: Handle keyboard delete/backspace for images
    const handleImageDeleteKeypress = (e: KeyboardEvent) => {
      // Allow deletion if intentional
      if (intentionalImageDeletionRef.current) {
        return;
      }

      if (e.key !== "Backspace" && e.key !== "Delete") return;

      const range = quill.getSelection();
      if (!range) return;

      let imageDetected = false;
      let imageIndex = -1;
      let imgInfo = null;

      // Check if an image is selected
      if (range.length > 0) {
        for (let i = range.index; i < range.index + range.length; i++) {
          const result = checkForImageAt(i);
          if (result.isImage) {
            imageDetected = true;
            imageIndex = i;
            imgInfo = result.imgInfo;
            break;
          }
        }
      }

      // For Backspace key
      if (!imageDetected && e.key === "Backspace" && range.index > 0) {
        const result = checkForImageAt(range.index - 1);
        if (result.isImage) {
          imageDetected = true;
          imageIndex = range.index - 1;
          imgInfo = result.imgInfo;
        }
      }

      // For Delete key
      if (!imageDetected && e.key === "Delete") {
        const result = checkForImageAt(range.index);
        if (result.isImage) {
          imageDetected = true;
          imageIndex = range.index;
          imgInfo = result.imgInfo;
        }

        // Also check next position
        const nextResult = checkForImageAt(range.index + 1);
        if (nextResult.isImage) {
          imageDetected = true;
          imageIndex = range.index + 1;
          imgInfo = nextResult.imgInfo;
        }
      }

      // If we found an image, show the delete dialog
      if (imageDetected && imgInfo) {
        const imgElement = (imgInfo.leaf as any).domNode as HTMLElement;

        if (imgElement) {
          // Select the image first
          if (imageIndex >= 0) {
            quill.setSelection(imageIndex, 2);
          }

          // Update selected image state
          setSelectedImage({
            index: imageIndex,
            imgElement: imgElement,
            imgInfo: imgInfo,
          });

          // Open the delete dialog
          openDeleteDialog();

          // Prevent default keyboard behavior
          e.preventDefault();
          e.stopImmediatePropagation();
          return false;
        } else {
          // Even without element, try to prevent default and show dialog
          setSelectedImage({
            index: imageIndex,
            imgElement: null as any,
            imgInfo: imgInfo,
          });

          openDeleteDialog();
          e.preventDefault();
          e.stopImmediatePropagation();
          return false;
        }
      }
    };

    // Handle basic keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      // Simple implementation to handle arrow keys
      const range = quill.getSelection();
      if (!range) return;
    };

    // Add event listeners
    quill.on("selection-change", handleSelectionChange);

    const editorElement = quill.container.querySelector(".ql-editor");
    if (editorElement) {
      // Use the capture phase for keyboard events to catch them first
      document.addEventListener("keydown", handleImageDeleteKeypress, true);
      document.addEventListener("keydown", preventImageReplacement, true);

      // Regular handlers
      editorElement.addEventListener("keydown", handleKeyDown as any);
      editorElement.addEventListener("paste", preventPasteOnImage as any);
    }

    // Clean up
    return () => {
      if (currentlyHighlighted) {
        highlightImage(currentlyHighlighted, false);
      }

      quill.off("selection-change", handleSelectionChange);

      document.removeEventListener("keydown", handleImageDeleteKeypress, true);
      document.removeEventListener("keydown", preventImageReplacement, true);

      if (editorElement) {
        editorElement.removeEventListener("keydown", handleKeyDown as any);
        editorElement.removeEventListener("paste", preventPasteOnImage as any);
      }

      // Restore original methods
      if (originalDeleteText) {
        (quill as any).deleteText = originalDeleteText;
      }

      if (originalInsertText) {
        (quill as any).insertText = originalInsertText;
      }
    };
  }, [quill, openDeleteDialog]);

  return (
    <>
      <EditorImageUploader quill={quill} />

      {selectedImage && (
        <ImageBubbleToolbar
          quill={quill}
          selectedImage={selectedImage.imgInfo}
          onAlignImage={handleAlignImage}
          onDeleteImage={handleDeleteImage}
        />
      )}
    </>
  );
};

export default SimpleImageHandler;
