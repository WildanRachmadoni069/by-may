"use client";

import React, { useEffect, useState, useRef } from "react";
import Quill from "quill";
import ImageBubbleToolbar from "./ImageBubbleToolbar";
import "./image-bubble-toolbar.css";

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
  const [selectedImage, setSelectedImage] = useState<SelectedImageInfo | null>(
    null
  );
  
  // Flag to track if we're performing intentional image deletion
  const intentionalImageDeletionRef = useRef<boolean>(false);

  // Store key functions in ref to access across renders
  const applyImageAlignmentRef =
    useRef<(imgInfo: any, alignment: string) => void>();
  const quillRef = useRef(quill);
  // Update quill ref whenever prop changes
  useEffect(() => {
    quillRef.current = quill;
    console.log("[SimpleImageHandler] Quill instance updated");
  }, [quill]);

  // Setup alignment function reference - runs only once
  useEffect(() => {
    applyImageAlignmentRef.current = (imgInfo: any, alignment: string) => {
      console.log(
        `[SimpleImageHandler] Applying alignment ${alignment} to image from ref`,
        imgInfo
      );

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

        console.log(`Applied ${alignment} alignment to image via ref`);
      } catch (error) {
        console.error("Error applying alignment to image:", error);
      }
    };
    console.log(
      "[SimpleImageHandler] applyImageAlignmentRef is now initialized"
    );
  }, []);
  // Handler for aligning images from the bubble toolbar
  const handleAlignImage = (alignment: string) => {
    console.log(
      `[SimpleImageHandler] Align image called with alignment: ${alignment}`
    );
    console.log(`[SimpleImageHandler] Current selectedImage:`, selectedImage);

    if (selectedImage && selectedImage.imgInfo) {
      if (applyImageAlignmentRef.current) {
        console.log(`[SimpleImageHandler] Applying alignment via ref`);
        applyImageAlignmentRef.current(selectedImage.imgInfo, alignment);

        // After alignment is applied, force an update to the selectedImage object
        // to ensure the toolbar position updates correctly
        setTimeout(() => {
          if (selectedImage && selectedImage.imgElement) {
            // Create a new selectedImage object with the same properties
            // This will trigger the useEffect in ImageBubbleToolbar
            setSelectedImage({
              ...selectedImage,
              // Add timestamp to force React to treat it as a new object
              _updated: Date.now(),
            });
          }
        }, 10);
      } else {
        console.error(
          "[SimpleImageHandler] applyImageAlignmentRef is not set, attempting direct alignment"
        );

        try {
          // Fall back to direct DOM manipulation if ref is not available
          const imgElement = selectedImage.imgElement;
          if (imgElement && imgElement.tagName === "IMG") {
            // Remove existing alignment classes
            imgElement.classList.remove(
              "ql-align-left",
              "ql-align-center",
              "ql-align-right",
              "ql-align-justify"
            );

            // Add appropriate class and styles based on alignment
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
              // Default to left alignment
              imgElement.classList.add("ql-align-left");
              imgElement.style.float = "left";
              imgElement.style.marginRight = "1em";
              imgElement.style.marginBottom = "1em";
            }
            console.log(
              `[SimpleImageHandler] Applied ${alignment} alignment directly to image`
            );

            // Force update after direct manipulation too
            setTimeout(() => {
              setSelectedImage({
                ...selectedImage,
                _updated: Date.now(),
              });
            }, 10);
          }
        } catch (error) {
          console.error(
            "[SimpleImageHandler] Error applying alignment directly:",
            error
          );
        }
      }
    } else {
      console.error("[SimpleImageHandler] No image selected for alignment");
    }
  };
  // Handler for deleting images from the bubble toolbar
  const handleDeleteImage = () => {
    if (selectedImage) {
      console.log("[SimpleImageHandler] Delete image requested", selectedImage);

      try {
        // Implement actual image deletion
        // First move cursor before the image
        const index = selectedImage.index;

        // Delete the image content (length 1 is usually sufficient for embedded content)
        if (quillRef.current) {
          console.log(`[SimpleImageHandler] Deleting image at index ${index}`);

          // First make sure any highlighting is removed
          if (selectedImage.imgElement) {
            selectedImage.imgElement.style.border = "";
            selectedImage.imgElement.style.borderRadius = "";
            selectedImage.imgElement.style.boxShadow = "";
            selectedImage.imgElement.classList.remove("ql-image-selected");
          }          // Set a flag to temporarily bypass image deletion prevention
          // This is needed to avoid conflicts with our safeguards
          intentionalImageDeletionRef.current = true;
          const imageToDelete = { ...selectedImage };
          setSelectedImage(null); // Clear selection first to avoid interference

          // Then delete the content with "api" source parameter to bypass protection
          quillRef.current.deleteText(index, 2, "api");

          // Reset flag after deletion
          setTimeout(() => {
            intentionalImageDeletionRef.current = false;
            // Move cursor to deletion point
            quillRef.current?.setSelection(index, 0);
          }, 10);
        } else {
          // Fallback if quill instance not available
          quill.setSelection(selectedImage.index - 1, 0);
          console.log("[SimpleImageHandler] Using fallback deletion method");
        }
      } catch (error) {
        console.error("[SimpleImageHandler] Error deleting image:", error);
        // Fallback to just moving cursor
        quill.setSelection(selectedImage.index - 1, 0);
      }
    } else {
      console.error("[SimpleImageHandler] No image selected for deletion");
    }
  };
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
    }; // Track the currently highlighted image
    let currentlyHighlighted: any = null; // Apply alignment to selected image
    const applyAlignmentToImage = (imgInfo: any, alignment: string) => {
      console.log(
        `[SimpleImageHandler] Applying alignment ${alignment} to image`,
        imgInfo
      );

      // Use the function from the ref if available, otherwise handle it directly
      if (applyImageAlignmentRef.current) {
        applyImageAlignmentRef.current(imgInfo, alignment);
        return;
      }
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
    }; // Handle selection change to detect when an image is selected
    const handleSelectionChange = (range: any) => {
      if (!range) {
        // Selection was removed, clear selected image
        setSelectedImage(null);

        if (currentlyHighlighted) {
          highlightImage(currentlyHighlighted, false);
          currentlyHighlighted = null;
        }
        return;
      }

      // Remove highlight from previously selected image
      if (currentlyHighlighted) {
        highlightImage(currentlyHighlighted, false);
        currentlyHighlighted = null;
      }

      // Reset selected image state
      setSelectedImage(null);

      // Check if cursor is on an image OR if selection includes an image
      // First check at the selection index
      const { isImage, imgInfo } = checkForImageAt(range.index);

      // For range.length === 2, we need to check if both parts are the same image
      let isImageSelection = false;
      if (range.length === 2) {
        const { isImage: isImage1 } = checkForImageAt(range.index);
        const { isImage: isImage2 } = checkForImageAt(range.index + 1);
        isImageSelection = isImage1 && isImage2;
      }

      if (isImage) {
        console.log("[Image Selected]", imgInfo);
        highlightImage(imgInfo, true);
        currentlyHighlighted = imgInfo;

        // Get actual DOM element for the image
        const imgElement = (imgInfo.leaf as any).domNode as HTMLElement;
        if (imgElement) {
          // Update selectedImage state for bubble toolbar
          setSelectedImage({
            index: range.index,
            imgElement: imgElement,
            imgInfo: imgInfo,
          });

          console.log(
            `[handleSelectionChange] Set selectedImage at index ${range.index}`
          );
        }
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
        (e.key.startsWith("F") && e.key.length > 1) // F1-F12
      )
        return;

      // Special handling for Enter key - insert paragraph after the image instead of replacing it
      if (e.key === "Enter") {
        const range = quill.getSelection();
        if (range && range.length > 0) {
          for (let i = range.index; i < range.index + range.length; i++) {
            const { isImage, imgInfo } = checkForImageAt(i);
            if (isImage && imgInfo) {
              console.log(
                "[Enter pressed on selected image] Inserting new paragraph after image"
              );
              e.preventDefault();
              e.stopPropagation();

              // Calculate position after image - usually image takes 2 positions in Quill
              // First, find the end position of the image
              let imageEndPosition = range.index;
              if (range.length === 2) {
                // If we have a proper image selection with length 2
                imageEndPosition = range.index + range.length;
              } else {
                // Try to find the actual end of image
                imageEndPosition = imgInfo.index + 1;
                // Check if the next position is still part of the image
                const { isImage: isNextPosImage } =
                  checkForImageAt(imageEndPosition);
                if (isNextPosImage) {
                  imageEndPosition += 1;
                }
              }

              // Insert a new paragraph after the image
              quill.insertText(imageEndPosition, "\n");
              // Move cursor to the new paragraph
              quill.setSelection(imageEndPosition + 1, 0);
              return false;
            }
          }
        }
        // Continue with normal Enter behavior if no image is selected
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

    // Handle keyboard navigation and key events
    const handleKeyDown = (e: KeyboardEvent) => {
      const range = quill.getSelection();
      if (!range) return; // First check if we need to prevent character input on selected image
      if (
        e.key !== "Backspace" &&
        e.key !== "Delete" &&
        e.key !== "Enter" && // Skip enter here since we handle it in preventImageReplacement
        !e.key.startsWith("Arrow") &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        if (range.length > 0) {
          for (let i = range.index; i < range.index + range.length; i++) {
            const { isImage } = checkForImageAt(i);
            if (isImage) {
              console.log(`[Prevented replacing image with: ${e.key}]`);
              e.preventDefault();
              e.stopPropagation();
              return;
            }
          }
        }
      }

      // Prevent accidental image deletion with backspace/delete
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
    }; // Handle direct clicks on images
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

            // Update selectedImage state for bubble toolbar
            setSelectedImage({
              index: imgInfo.index,
              imgElement: target,
              imgInfo: imgInfo,
            });

            console.log(
              `[handleEditorClick] Set selectedImage at index ${imgInfo.index}`
            );

            // Menggunakan length 2 untuk seleksi gambar (karena gambar menempati index 139-140)
            quill.setSelection(imgInfo.index, 2);
            break;
          }
        }
      } else {
        // Click was not on an image, clear selection if clicking outside
        if (selectedImage && !e.defaultPrevented) {
          setSelectedImage(null);
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
    };    // Create a safer wrapper for the deleteText method
    const originalDeleteText = quill.deleteText.bind(quill);
    const safeDeleteText = function (
      index: number,
      length: number,
      source?: any
    ): void {
      // Allow deletion if source is "silent" or "api" (programmatic deletion)
      // This is to enable our custom delete button to work
      if (source === "silent" || source === "api") {
        console.log("[Allowing programmatic deletion]", { index, length, source });
        originalDeleteText(index, length, source);
        return;
      }
      
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
    };    // Listen for text changes
    quill.on("text-change", handleTextChange); 
    
    // Add an ultra-aggressive keydown handler with capture phase that runs first
    const preventImageDeleteCapture = (e: KeyboardEvent) => {
      // Allow deletion if we're intentionally deleting via our API
      if (intentionalImageDeletionRef.current) {
        console.log("[CAPTURE] Allowing intentional image deletion");
        return;
      }

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
      // Add new event listener for preventing character input on images
      document.addEventListener("keydown", preventImageReplacement, true);
      // Add paste event handler
      editorElement.addEventListener("paste", preventPasteOnImage as any);
      // Regular handlers
      editorElement.addEventListener("keydown", handleKeyDown as any);
      editorElement.addEventListener("click", handleEditorClick as any);
    }

    // Create wrapper for Quill's insertText to prevent inserting at image position
    const originalInsertText = quill.insertText.bind(quill);
    const safeInsertText = function (
      index: number,
      text: string,
      source?: any
    ): void {
      // Check if we're trying to insert at an image position
      const { isImage } = checkForImageAt(index);
      if (isImage) {
        console.log("[Blocked text insertion at image position]", {
          index,
          text,
        });
        return;
      }

      // If not inserting at image position, proceed with original insertion
      originalInsertText(index, text, source);
    };

    // Replace Quill's insertText method with our safer version
    (quill as any).insertText = safeInsertText;

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
      document.removeEventListener("keydown", preventImageReplacement, true);

      const editorElement = quill.container.querySelector(".ql-editor");
      if (editorElement) {
        editorElement.removeEventListener("keydown", handleKeyDown as any);
        editorElement.removeEventListener("click", handleEditorClick as any);
        editorElement.removeEventListener("paste", preventPasteOnImage as any);
      }

      // Remove toolbar click listener
      const toolbar = quill.getModule("toolbar") as any;
      if (toolbar && toolbar.container) {
        toolbar.container.removeEventListener("click", handleToolbarClick);
      }

      // Restore original methods if we patched them
      if (originalDeleteText) {
        (quill as any).deleteText = originalDeleteText;
      }

      if (originalInsertText) {
        (quill as any).insertText = originalInsertText;
      }
    };
  }, [quill]);
  // Add the ImageBubbleToolbar component to render the toolbar
  // when an image is selected
  return (
    <>
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
