"use client";
import React, { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface QuillEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
}

const QuillEditor = forwardRef<Quill, QuillEditorProps>(
  ({ value, onChange, readOnly = false, className = "" }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const onChangeRef = useRef(onChange);
    const imageTracker = useRef<Set<string>>(new Set()); // Track uploaded images

    useLayoutEffect(() => {
      onChangeRef.current = onChange;
    });

    useEffect(() => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const editorContainer = container.appendChild(
        container.ownerDocument.createElement("div")
      );

      const quill = new Quill(editorContainer, {
        theme: "snow",
        modules: {
          toolbar: {
            container: [
              [{ header: [2, 3, false] }],
              [{ align: [] }],
              [{ indent: "-1" }, { indent: "+1" }],
              [{ color: [] }, { background: [] }],
              ["bold", "italic", "underline", "strike", "blockquote"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["link", "image"],
            ],
          },
          clipboard: {
            matchVisual: false,
          },
        },
        formats: [
          "header",
          "align",
          "indent",
          "color",
          "background",
          "bold",
          "italic",
          "underline",
          "strike",
          "blockquote",
          "list",
          "link",
          "image",
        ],
      });

      // Add custom image handling
      const ImageBlot = Quill.import("formats/image") as any;
      ImageBlot.sanitize = function (url: string) {
        return url;
      };
      Quill.register(ImageBlot, true);

      // Extract URLs of images that are already in the content
      const extractExistingImages = (htmlContent: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, "text/html");
        const images = doc.querySelectorAll("img");
        const urls = new Set<string>();
        images.forEach((img) => {
          if (img.src.includes("cloudinary.com")) {
            urls.add(img.src);
          }
        });
        return urls;
      };

      // Initialize with existing images if any
      if (value) {
        const existingImages = extractExistingImages(value);
        existingImages.forEach((url) => imageTracker.current.add(url));
      }

      // Function to extract public_id from Cloudinary URL
      const getPublicIdFromUrl = (url: string): string | null => {
        // Patterns for matching Cloudinary URLs with potential folder structures
        // Improved to handle both folder/publicId and direct publicId formats
        const folderMatch = url.match(/\/upload\/v\d+\/([^\.]+)\.\w+$/);
        if (folderMatch && folderMatch[1]) {
          return folderMatch[1]; // This will include folder path if it exists
        }

        // Fallback to the simpler pattern which might miss folders
        const simpleMatch = url.match(/\/v\d+\/([^/]+)\.\w+$/);
        return simpleMatch ? simpleMatch[1] : null;
      };

      // Modified image handler with tracking
      const imageHandler = async function () {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = async () => {
          const file = input.files?.[0];
          if (file) {
            try {
              const formData = new FormData();
              formData.append("image", file);

              const response = await fetch(
                "/api/upload/image-article-content",
                {
                  method: "POST",
                  body: formData,
                }
              );

              if (!response.ok) throw new Error("Upload failed");

              const data = await response.json();

              // Add to tracker
              imageTracker.current.add(data.secure_url);

              // Get current selection or default to end
              const range = quill.getSelection(true);

              // Insert a new line before image if we're not at the start
              if (range.index > 0) {
                quill.insertText(range.index, "\n");
              }

              // Insert the image
              quill.insertEmbed(range.index, "image", data.secure_url);

              // Move cursor to next line
              quill.insertText(range.index + 1, "\n");
              quill.setSelection(range.index + 2, 0);
            } catch (error) {
              console.error("Error uploading image:", error);
            }
          }
        };
      };

      // Update toolbar configuration with new handler
      const toolbar = quill.getModule("toolbar") as {
        addHandler: (type: string, handler: () => void) => void;
      };
      toolbar.addHandler("image", imageHandler);

      // Add custom CSS for images
      const style = document.createElement("style");
      style.innerHTML = `
        .ql-editor img {
          display: block;
          max-width: 100%;
          margin: 1em 0;
        }
      `;
      document.head.appendChild(style);

      // Improved implementation to detect image deletions by comparing the current content with the tracked images
      const checkForDeletedImages = (htmlContent: string) => {
        // Extract current image URLs from content
        const currentImages = extractExistingImages(htmlContent);
        const imagesToDelete = new Set<string>();

        // Find images that were in the tracker but are no longer in the content
        imageTracker.current.forEach((url) => {
          if (!currentImages.has(url)) {
            imagesToDelete.add(url);
          }
        });

        // Update the tracker
        imageTracker.current = currentImages;

        // Delete the removed images
        imagesToDelete.forEach(async (url) => {
          try {
            const publicId = getPublicIdFromUrl(url);
            if (!publicId) return;

            console.log("Attempting to delete image with public_id:", publicId);

            await fetch("/api/upload/image-article-content/delete", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ publicId }),
            });
          } catch (error) {
            console.error("Error deleting image:", error);
          }
        });
      };

      // Update event handler to use the new approach
      quill.on(Quill.events.TEXT_CHANGE, () => {
        const htmlContent = quill.root.innerHTML;

        // Check for and delete removed images
        checkForDeletedImages(htmlContent);

        // Call the onChange prop
        onChangeRef.current?.(htmlContent);
      });

      if (typeof ref === "function") {
        ref(quill);
      } else if (ref) {
        ref.current = quill;
      }

      // Set initial content
      if (value) {
        quill.root.innerHTML = value;
      }

      quill.enable(!readOnly);

      return () => {
        // We don't need to delete all images on cleanup
        // as we only want to delete images that were removed from the content

        // Clean up the ref
        if (typeof ref === "function") {
          ref(null);
        } else if (ref) {
          ref.current = null;
        }

        container.innerHTML = "";
        style.remove();
      };
    }, [ref]);

    useEffect(() => {
      if (ref && "current" in ref && ref.current) {
        ref.current.enable(!readOnly);
      }
    }, [ref, readOnly]);

    return (
      <div className={`relative ${className}`}>
        <style jsx global>{`
          .ql-toolbar.ql-snow {
            border: 1px solid #e2e8f0;
            border-top-left-radius: 0.375rem;
            border-top-right-radius: 0.375rem;
            border-bottom: none;
            background: white;
          }
          .ql-container.ql-snow {
            border: 1px solid #e2e8f0;
            border-bottom-left-radius: 0.375rem;
            border-bottom-right-radius: 0.375rem;
            height: calc(100% - 42px);
            background: white;
          }
          .ql-editor {
            min-height: 300px;
          }
        `}</style>
        <div ref={containerRef} className="h-full" />
      </div>
    );
  }
);

QuillEditor.displayName = "QuillEditor";

export default QuillEditor;
