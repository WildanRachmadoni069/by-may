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
    if (!quill) return;

    // Helper function to check if a leaf node is an image
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
    }; // Helper function to add modern border to selected image
    const highlightImage = (imgInfo: any, highlight: boolean = true) => {
      try {
        if (!imgInfo) return;

        // Find the image element
        const imgElement = (imgInfo.leaf as any).domNode as HTMLElement;
        if (!imgElement) return;

        // Add/remove highlight styles
        if (highlight) {
          // Modern styling with elegant border, no background color block
          imgElement.style.border = "2px solid #3b82f6"; // Modern blue color
          imgElement.style.borderRadius = "4px";
          imgElement.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)";
          imgElement.style.transition = "all 0.2s ease";

          // Add class for CSS selector to target selected images
          imgElement.classList.add("ql-image-selected");

          // Add additional attributes to prevent text-like selection
          imgElement.setAttribute("unselectable", "on");
        } else {
          // Reset all styles
          imgElement.style.border = "";
          imgElement.style.borderRadius = "";
          imgElement.style.boxShadow = "";
          imgElement.style.transition = "";

          // Remove selection class and attributes
          imgElement.classList.remove("ql-image-selected");
          imgElement.removeAttribute("unselectable");
        }
      } catch (error) {
        console.error("Error highlighting image:", error);
      }
    };

    // Track the currently highlighted image
    let currentlyHighlighted: any = null;

    // Apply alignment to selected image
    const applyAlignmentToImage = (imgInfo: any, alignment: string) => {
      try {
        if (!imgInfo) return;

        const imgElement = (imgInfo.leaf as any).domNode as HTMLElement;
        if (!imgElement) return;

        // Remove all existing alignment classes
        imgElement.classList.remove(
          "ql-align-left",
          "ql-align-center",
          "ql-align-right",
          "ql-align-justify"
        );

        // Reset inline styles that might interfere
        imgElement.style.float = "";
        imgElement.style.marginLeft = "";
        imgElement.style.marginRight = "";
        imgElement.style.display = "";

        if (alignment === "left") {
          imgElement.classList.add("ql-align-left");
          imgElement.style.float = "left";
          imgElement.style.marginRight = "1em";
          imgElement.style.marginBottom = "1em";
        } else if (alignment === "center") {
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
          // Default or 'justify' - modified to behave like left alignment for images
          imgElement.classList.add("ql-align-justify");
          imgElement.style.float = "left";
          imgElement.style.marginRight = "1em";
          imgElement.style.marginBottom = "1em";
        }

        console.log(`Applied ${alignment} alignment to image`);
      } catch (error) {
        console.error("Error applying alignment to image:", error);
      }
    };

    // Track toolbar button clicks for alignment
    const handleToolbarClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const alignButton =
        target.closest("button.ql-align") ||
        target.closest('[class*="ql-align-"]') ||
        target.closest(".ql-picker-item");

      if (alignButton && currentlyHighlighted) {
        // Get the alignment value from the button
        let alignment = "left"; // default

        if (
          alignButton.classList.contains("ql-align-center") ||
          alignButton.getAttribute("data-value") === "center"
        ) {
          alignment = "center";
        } else if (
          alignButton.classList.contains("ql-align-right") ||
          alignButton.getAttribute("data-value") === "right"
        ) {
          alignment = "right";
        } else if (
          alignButton.classList.contains("ql-align-justify") ||
          alignButton.getAttribute("data-value") === "justify"
        ) {
          alignment = "justify";
        }

        // Apply the alignment to the selected image
        applyAlignmentToImage(currentlyHighlighted, alignment);
      }
    };

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
          // We don't auto-highlight images to the right anymore
          // Just log them for debugging
        }

        // Check for image to the left
        if (range.index > 0) {
          const leftPos = range.index - 1;
          const { isImage: isImageLeft, imgInfo: imgInfoLeft } =
            checkForImageAt(leftPos);

          if (isImageLeft) {
            console.log("[Image to LEFT]", imgInfoLeft);
            // We don't auto-highlight images to the left either
          }
        }
      }
    };

    // Handle keyboard navigation and key events
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
      } // For arrow keys, check if there's an image in that direction
      if (e.key === "ArrowRight") {
        // Case 1: Image is already selected (range.length === 2 untuk gambar)
        if (range.length === 2) {
          const { isImage: isSelectedImage } = checkForImageAt(range.index);
          if (isSelectedImage) {
            // We're on an already-selected image, move to position after image
            console.log(
              `[ArrowRight] Moving after selected image to index ${
                range.index + 2
              }`
            );
            e.preventDefault();
            quill.setSelection(range.index + 2, 0);
            return;
          }
        }

        // Case 2: Check if cursor is at index where image starts
        const { isImage: isCurrentImage } = checkForImageAt(range.index);
        const { isImage: isNextImage, imgInfo: nextImgInfo } = checkForImageAt(
          range.index + 1
        ); // If cursor is at index before image (like 138)
        if (
          !isCurrentImage &&
          isNextImage &&
          nextImgInfo &&
          range.length === 0
        ) {
          // First arrow right: select the image rather than jumping over it
          console.log(
            `[ArrowRight] Selecting image at index ${nextImgInfo.index}`
          );
          e.preventDefault(); // Highlight gambar secara manual terlebih dahulu
          highlightImage(nextImgInfo, true);
          currentlyHighlighted = nextImgInfo;

          // Set selection dengan length 2 karena gambar menempati 2 index (139-140)
          quill.setSelection(nextImgInfo.index, 2);

          // Gunakan setTimeout untuk memastikan selection tetap pada gambar
          // Quill mungkin mencoba "menormalkan" selection setelah kita mengaturnya
          setTimeout(() => {
            const currentSelection = quill.getSelection();
            if (
              currentSelection &&
              (currentSelection.index !== nextImgInfo.index ||
                currentSelection.length !== 2)
            ) {
              console.log(
                "[ArrowRight] Mempertahankan seleksi gambar dengan length 2"
              );
              quill.setSelection(nextImgInfo.index, 2);
            }
          }, 10);

          return;
        } // Case 3: We're ON an image but it's not explicitly selected
        if (isCurrentImage && range.length === 0) {
          console.log(
            `[ArrowRight] On image, selecting the image at index ${range.index}`
          );
          e.preventDefault();

          // Seleksi gambar terlebih dahulu alih-alih melompat ke posisi selanjutnya
          // Highlight gambar secara manual untuk memastikan visual seleksi muncul
          const { imgInfo } = checkForImageAt(range.index);
          if (imgInfo) {
            highlightImage(imgInfo, true);
            currentlyHighlighted = imgInfo; // Set seleksi dengan length 2 karena gambar menempati 2 index (139-140)
            quill.setSelection(range.index, 2);

            // Gunakan setTimeout untuk memastikan seleksi tetap pada gambar
            setTimeout(() => {
              const currentSelection = quill.getSelection();
              if (
                currentSelection &&
                (currentSelection.index !== range.index ||
                  currentSelection.length !== 2)
              ) {
                console.log(
                  "[ArrowRight] Mempertahankan seleksi gambar pada posisi yang sama dengan length 2"
                );
                quill.setSelection(range.index, 2);
              }
            }, 10);
          }
          return;
        }
      } else if (e.key === "ArrowLeft" && range.index > 0) {
        // Case 1: Image is already selected (range.length === 2 untuk gambar)
        if (range.length === 2) {
          const { isImage: isSelectedImage } = checkForImageAt(range.index);
          if (isSelectedImage) {
            // We're on an already-selected image, move to position before image
            console.log(
              `[ArrowLeft] Moving before selected image to index ${
                range.index - 1
              }`
            );
            e.preventDefault();
            quill.setSelection(range.index - 1, 0);
            return;
          }
        } // Case 2: We're currently at an image position but not selected
        const { isImage: isCurrentImage } = checkForImageAt(range.index);
        if (isCurrentImage && range.length === 0) {
          console.log(
            `[ArrowLeft] On image, selecting the image at index ${range.index}`
          );
          e.preventDefault();

          // Seleksi gambar terlebih dahulu alih-alih melompat ke posisi sebelumnya
          // Highlight gambar secara manual untuk memastikan visual seleksi muncul
          const { imgInfo } = checkForImageAt(range.index);
          if (imgInfo) {
            highlightImage(imgInfo, true);
            currentlyHighlighted = imgInfo; // Set seleksi dengan length 2 karena gambar menempati 2 index (139-140)
            quill.setSelection(range.index, 2);

            // Gunakan setTimeout untuk memastikan seleksi tetap pada gambar
            setTimeout(() => {
              const currentSelection = quill.getSelection();
              if (
                currentSelection &&
                (currentSelection.index !== range.index ||
                  currentSelection.length !== 2)
              ) {
                console.log(
                  "[ArrowLeft] Mempertahankan seleksi gambar pada posisi yang sama dengan length 2"
                );
                quill.setSelection(range.index, 2);
              }
            }, 10);
          }
          return;
        } // Case 3: We're just after an image (like at position 141)
        // Check if there's an image at the position immediately to our left
        const { isImage, imgInfo } = checkForImageAt(range.index - 1);
        if (isImage && imgInfo) {
          console.log("[Navigating LEFT to image]", imgInfo);
          e.preventDefault();

          // Untuk posisi 141 (setelah gambar), imgInfo.index adalah 140 (akhir gambar)
          // Kita perlu mengurangi 1 untuk mendapatkan posisi awal gambar (139)
          const imageStartIndex = imgInfo.index - 1;
          console.log(
            `[ArrowLeft] Selecting image starting at index ${imageStartIndex}`
          );

          // Highlight gambar terlebih dahulu
          highlightImage(imgInfo, true);
          currentlyHighlighted = imgInfo;

          // Gunakan length 2 untuk seleksi gambar (karena gambar menempati index 139-140)
          quill.setSelection(imageStartIndex, 2);

          // Gunakan setTimeout untuk memastikan seleksi tetap pada gambar
          setTimeout(() => {
            const currentSelection = quill.getSelection();
            if (
              currentSelection &&
              (currentSelection.index !== imageStartIndex ||
                currentSelection.length !== 2)
            ) {
              console.log(
                `[ArrowLeft] Mempertahankan seleksi gambar pada index ${imageStartIndex} dengan length 2`
              );
              quill.setSelection(imageStartIndex, 2);
            }
          }, 10);
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
            console.log("[Image clicked] Selecting with length 2", imgInfo);

            // Highlight gambar terlebih dahulu
            highlightImage(imgInfo, true);
            currentlyHighlighted = imgInfo;

            // Menggunakan length 2 untuk seleksi gambar (karena gambar menempati index 139-140)
            quill.setSelection(imgInfo.index, 2);
            break;
          }
        }
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

    // Create a safer wrapper for the deleteText method
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
    quill.on("text-change", handleTextChange); // Add an ultra-aggressive keydown handler with capture phase that runs first
    const preventImageDeleteCapture = (e: KeyboardEvent) => {
      if (e.key !== "Backspace" && e.key !== "Delete") return;

      const range = quill.getSelection();
      if (!range) return;

      // First check if an image is currently selected (works for both Backspace and Delete)
      if (range.length > 0) {
        for (let i = range.index; i < range.index + range.length; i++) {
          const { isImage } = checkForImageAt(i);
          if (isImage) {
            console.log("[CAPTURE] Prevented deletion of selected image");
            e.preventDefault();
            e.stopImmediatePropagation(); // Stop other handlers from running
            return false;
          }
        }
      }

      // For Backspace, prevent if image is at position - 1
      if (e.key === "Backspace" && range.index > 0) {
        const { isImage } = checkForImageAt(range.index - 1);
        if (isImage) {
          console.log("[CAPTURE] Prevented backspace deletion of image");
          e.preventDefault();
          e.stopImmediatePropagation(); // Stop other handlers from running
          return false;
        }
      }

      // For Delete key, prevent if image is at current position OR the next position
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

    // Handle alignment from format module
    const handleFormatChange = (format: string, value: any) => {
      if (format === "align" && currentlyHighlighted) {
        console.log(`[Format Change] Align: ${value}`);
        applyAlignmentToImage(currentlyHighlighted, value || "left");
      }
    }; // Watch for toolbar changes specifically for alignment
    const toolbar = quill.getModule("toolbar") as any;
    if (toolbar && toolbar.container) {
      // Add listener to all alignment buttons in the toolbar
      const toolbarContainer = toolbar.container;
      toolbarContainer.addEventListener("click", handleToolbarClick);
    }

    // Add event listeners
    quill.on("selection-change", handleSelectionChange);
    quill.on("editor-change", (eventName: string, ...args: any[]) => {
      if (eventName === "text-change" && args.length >= 3) {
        const [delta, oldContents, source] = args;
        if (source === "user" && delta.ops) {
          // Find format-related operations
          delta.ops.forEach((op: any) => {
            if (op.attributes && op.attributes.align !== undefined) {
              handleFormatChange("align", op.attributes.align);
            }
          });
        }
      }
    });

    const editorElement = quill.container.querySelector(".ql-editor");
    if (editorElement) {
      // Capturing phase runs before bubbling phase
      document.addEventListener("keydown", preventImageDeleteCapture, true);
      // Regular handlers
      editorElement.addEventListener("keydown", handleKeyDown as any);
      editorElement.addEventListener("click", handleEditorClick as any);
    }

    // Clean up
    return () => {
      // Remove highlighting from any selected image
      if (currentlyHighlighted) {
        highlightImage(currentlyHighlighted, false);
      }

      // Remove all event listeners
      quill.off("selection-change", handleSelectionChange);
      quill.off("text-change", handleTextChange);
      quill.off("editor-change");

      // Remove document capture listener
      document.removeEventListener("keydown", preventImageDeleteCapture, true);

      const editorElement = quill.container.querySelector(".ql-editor");
      if (editorElement) {
        editorElement.removeEventListener("keydown", handleKeyDown as any);
        editorElement.removeEventListener("click", handleEditorClick as any);
      }
      // Remove toolbar click listener
      const toolbar = quill.getModule("toolbar") as any;
      if (toolbar && toolbar.container) {
        toolbar.container.removeEventListener("click", handleToolbarClick);
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
