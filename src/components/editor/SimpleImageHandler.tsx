"use client";

import React, { useEffect } from "react";
import Quill from "quill";

interface SimpleImageHandlerProps {
  quill: Quill;
}

/**
 * A simplified component that just handles image selection detection
 * and keyboard navigation to images
 */
const SimpleImageHandler: React.FC<SimpleImageHandlerProps> = ({ quill }) => {
  useEffect(() => {
    if (!quill) return; // Helper function to check if a leaf node is an image
    const isLeafNodeImage = (leafAny: any): boolean => {
      if (!leafAny) return false;

      // Check if it's an image via embed
      const hasEmbed = !!(leafAny as any).embed;
      const isImage = hasEmbed && !!(leafAny as any).embed?.image;

      // Check if it's an image via DOM node
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
        // Get leaf at position
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
    }; // Helper function to add blue border to selected image
    const highlightImage = (imgInfo: any, highlight: boolean = true) => {
      try {
        if (!imgInfo) return;

        // Find the image element
        const imgElement = (imgInfo.leaf as any).domNode as HTMLElement;
        if (!imgElement) return;

        // Add/remove highlight styles
        if (highlight) {
          imgElement.style.border = "2px solid blue";
          imgElement.style.boxShadow = "0 0 5px rgba(0, 0, 255, 0.5)";
        } else {
          imgElement.style.border = "";
          imgElement.style.boxShadow = "";
        }
      } catch (error) {
        console.error("Error highlighting image:", error);
      }
    };

    // Track the currently highlighted image
    let currentlyHighlighted: any = null;

    // Handle selection change to detect when an image is selected
    const handleSelectionChange = (range: any) => {
      if (!range) return;

      // Remove highlight from previously selected image
      if (currentlyHighlighted) {
        highlightImage(currentlyHighlighted, false);
        currentlyHighlighted = null;
      }

      // Check if cursor is on an image
      const { isImage, imgInfo } = checkForImageAt(range.index);

      if (isImage) {
        console.log("[Image Selected]", imgInfo);
        highlightImage(imgInfo, true);
        currentlyHighlighted = imgInfo;
      } // Check for images adjacent to cursor (for keyboard navigation)
      if (range.length === 0) {
        // Only if it's a cursor, not a selection
        // Check for image to the right
        const rightPos = range.index + 1;
        const { isImage: isImageRight, imgInfo: imgInfoRight } =
          checkForImageAt(rightPos);

        if (isImageRight) {
          console.log("[Image to RIGHT]", imgInfoRight);
          // Highlight the image to the right as well to show it's protected
          highlightImage(imgInfoRight, true);
          currentlyHighlighted = imgInfoRight;
        }

        // Check for image to the left
        if (range.index > 0) {
          const leftPos = range.index - 1;
          const { isImage: isImageLeft, imgInfo: imgInfoLeft } =
            checkForImageAt(leftPos);

          if (isImageLeft) {
            console.log("[Image to LEFT]", imgInfoLeft);
          }
        }
      }
    }; // Handle keyboard navigation and key events
    const handleKeyDown = (e: KeyboardEvent) => {
      const range = quill.getSelection();
      if (!range) return; // Prevent accidental image deletion with backspace/delete
      if (e.key === "Backspace") {
        // Check if there's an image right before the cursor
        if (range.index > 0 && range.length === 0) {
          const { isImage, imgInfo } = checkForImageAt(range.index - 1);
          if (isImage) {
            // Cursor is right after an image, prevent backspace from deleting it
            console.log("[Prevented backspace deletion of image]", imgInfo);
            e.preventDefault();
            e.stopPropagation();
            return;
          }
        }

        // Also check if an image is selected (range.length > 0 and contains image)
        if (range.length > 0) {
          for (let i = range.index; i < range.index + range.length; i++) {
            const { isImage } = checkForImageAt(i);
            if (isImage) {
              console.log("[Prevented backspace deletion of selected image]");
              e.preventDefault();
              e.stopPropagation();
              return;
            }
          }
        }
      } else if (e.key === "Delete") {
        // Check if there's an image right at the cursor
        if (range.length === 0) {
          // Check at cursor position
          const { isImage, imgInfo } = checkForImageAt(range.index);
          if (isImage) {
            // Cursor is right before an image, prevent delete from removing it
            console.log("[Prevented delete key deletion of image]", imgInfo);
            e.preventDefault();
            e.stopPropagation();
            return;
          }

          // Also check at the position after cursor (this is the key fix)
          const { isImage: isNextImage, imgInfo: nextImgInfo } =
            checkForImageAt(range.index + 1);
          if (isNextImage) {
            // There's an image right after the cursor
            console.log(
              "[Prevented delete key deletion of image to right]",
              nextImgInfo
            );
            e.preventDefault();
            e.stopPropagation();
            return;
          }
        }

        // Also check if an image is selected (range.length > 0 and contains image)
        if (range.length > 0) {
          for (let i = range.index; i < range.index + range.length; i++) {
            const { isImage } = checkForImageAt(i);
            if (isImage) {
              console.log("[Prevented delete key deletion of selected image]");
              e.preventDefault();
              e.stopPropagation();
              return;
            }
          }
        }
      }

      // For arrow keys, check if there's an image in that direction
      if (e.key === "ArrowRight") {
        const { isImage, imgInfo } = checkForImageAt(range.index + 1);
        if (isImage) {
          console.log("[Navigating RIGHT to image]", imgInfo);

          // Select the image (set cursor position to the image)
          e.preventDefault(); // Prevent default navigation
          quill.setSelection(imgInfo.index, 1);
        }
      } else if (e.key === "ArrowLeft" && range.index > 0) {
        const { isImage, imgInfo } = checkForImageAt(range.index - 1);
        if (isImage) {
          console.log("[Navigating LEFT to image]", imgInfo);

          // Select the image (set cursor position to the image)
          e.preventDefault(); // Prevent default navigation
          quill.setSelection(imgInfo.index, 1);
        }
      }
    };

    // Handle direct clicks on images
    const handleEditorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if an image was clicked
      if (target.tagName === "IMG") {
        console.log("[Image clicked directly]");

        // Find the index of this image in the editor
        let imgNode = target;
        const imgSrc = imgNode.getAttribute("src");

        // Find the image in the Quill document
        const documentLength = quill.getLength();
        for (let i = 0; i < documentLength; i++) {
          const { isImage, imgInfo } = checkForImageAt(i);
          if (isImage && imgInfo.src === imgSrc) {
            // Found the image that was clicked
            quill.setSelection(imgInfo.index, 1);
            break;
          }
        }
      }
    }; // Function to check if a range contains any images
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
    }; // Create a safer wrapper for the deleteText method
    const originalDeleteText = quill.deleteText.bind(quill);
    const safeDeleteText = function (
      index: number,
      length: number,
      source?: any
    ): void {
      // Check if we're trying to delete an image - be extra cautious
      if (rangeContainsImage(index, length)) {
        console.log("[Blocked deletion of image via API in range]", {
          index,
          length,
        });
        return;
      }

      // Also check if there's an image at the next position (for DELETE key)
      const { isImage: isNextImage } = checkForImageAt(index + length);
      if (isNextImage && length === 0) {
        console.log("[Blocked deletion of image to the right]", {
          index,
          length,
        });
        return;
      }

      // If not deleting an image, proceed with the original deletion
      originalDeleteText(index, length, source);
    };

    // Replace Quill's deleteText method with our safer version
    (quill as any).deleteText = safeDeleteText;

    // Also monitor text changes for debugging
    const handleTextChange = (delta: any, oldContents: any, source: string) => {
      // We only want to check user-initiated changes
      if (source !== "user") return;

      // Look for delete operations in the delta
      if (delta.ops) {
        delta.ops.forEach((op: any) => {
          if (op.delete && typeof op.delete === "number") {
            console.log("[Text deletion detected]", op.delete);
          }
        });
      }
    };

    // Listen for text changes
    quill.on("text-change", handleTextChange);
    // Add an ultra-aggressive keydown handler with capture phase that runs first
    const preventImageDeleteCapture = (e: KeyboardEvent) => {
      if (e.key !== "Backspace" && e.key !== "Delete") return;

      const range = quill.getSelection();
      if (!range) return;

      // For Backspace, prevent if image is at position - 1
      if (e.key === "Backspace" && range.index > 0) {
        const { isImage } = checkForImageAt(range.index - 1);
        if (isImage) {
          console.log("[CAPTURE] Prevented backspace deletion of image");
          e.preventDefault();
          e.stopImmediatePropagation(); // Stop other handlers from running
          return false;
        }
      } // For Delete key, prevent if image is at current position OR the next position
      if (e.key === "Delete") {
        // Check current position first
        const { isImage } = checkForImageAt(range.index);
        if (isImage) {
          console.log(
            "[CAPTURE] Prevented delete key deletion of image at cursor"
          );
          e.preventDefault();
          e.stopImmediatePropagation(); // Stop other handlers from running
          return false;
        }

        // Also check the next position (this is the key fix)
        const { isImage: isNextPositionImage } = checkForImageAt(
          range.index + 1
        );
        if (isNextPositionImage) {
          console.log(
            "[CAPTURE] Prevented delete key deletion of image to right"
          );
          e.preventDefault();
          e.stopImmediatePropagation(); // Stop other handlers from running
          return false;
        }
      }
    };

    // Add event listeners
    quill.on("selection-change", handleSelectionChange);
    const editorElement = quill.container.querySelector(".ql-editor");
    if (editorElement) {
      // Capturing phase runs before bubbling phase
      document.addEventListener("keydown", preventImageDeleteCapture, true);
      // Regular handlers
      editorElement.addEventListener("keydown", handleKeyDown as any);
      editorElement.addEventListener("click", handleEditorClick as any);
    } // Clean up
    return () => {
      // Remove highlighting from any selected image
      if (currentlyHighlighted) {
        highlightImage(currentlyHighlighted, false);
      }

      // Remove all event listeners
      quill.off("selection-change", handleSelectionChange);
      quill.off("text-change", handleTextChange);

      // Remove document capture listener
      document.removeEventListener("keydown", preventImageDeleteCapture, true);

      const editorElement = quill.container.querySelector(".ql-editor");
      if (editorElement) {
        editorElement.removeEventListener("keydown", handleKeyDown as any);
        editorElement.removeEventListener("click", handleEditorClick as any);
      }

      // Restore original deleteText if we patched it
      if (originalDeleteText) {
        (quill as any).deleteText = originalDeleteText;
      }
    };
  }, [quill]);

  // This component doesn't render anything
  return null;
};

export default SimpleImageHandler;
