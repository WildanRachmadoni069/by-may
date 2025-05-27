"use client";
import React, {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);

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
      }); // Add custom image handling with delete button functionality
      const Parchment = Quill.import("parchment");
      const ImageBlot = Quill.import("formats/image") as any;

      // Enhance image sanitization
      ImageBlot.sanitize = function (url: string) {
        return url;
      };

      // Create a custom image blot that supports delete button
      class ImageBlotWithDelete extends ImageBlot {
        static create(value: string) {
          const node = super.create(value);
          node.setAttribute("data-src", value);
          return node;
        }
      }

      Quill.register(ImageBlotWithDelete, true);

      // No need to track existing images anymore
      // Simplified image handling - no need to extract public_id      // Enhanced image handler with progress indicator and error handling
      const imageHandler = async function () {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = async () => {
          const file = input.files?.[0];
          if (file) {
            try {
              // Reset states
              setIsUploading(true);
              setUploadProgress(0);
              setUploadError(null);

              // Show upload started toast
              toast({
                title: "Mengupload gambar",
                description: "Mohon tunggu sebentar...",
              });

              const formData = new FormData();
              formData.append("image", file);

              // Create a custom fetch with progress tracking using XMLHttpRequest
              const xhr = new XMLHttpRequest();

              // Track upload progress
              xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                  const progress = Math.round(
                    (event.loaded / event.total) * 100
                  );
                  setUploadProgress(progress);
                }
              };

              // Create a promise to handle the XHR request
              const uploadPromise = new Promise<any>((resolve, reject) => {
                xhr.open("POST", "/api/upload/image-article");

                xhr.onload = () => {
                  if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                      const data = JSON.parse(xhr.responseText);
                      resolve(data);
                    } catch (e) {
                      reject(new Error("Failed to parse response"));
                    }
                  } else {
                    reject(
                      new Error(`Upload failed with status ${xhr.status}`)
                    );
                  }
                };

                xhr.onerror = () =>
                  reject(new Error("Network error during upload"));
                xhr.send(formData);
              });

              // Wait for the upload to complete
              const data = await uploadPromise;

              // Only need the secure_url for embedding the image
              if (data.secure_url) {
                toast({
                  title: "Gambar berhasil diupload",
                  variant: "default",
                });
              } else {
                console.error("No secure_url in response:", data);
                throw new Error("Image upload failed: No URL returned");
              } // Get current selection or default to end
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
              setUploadError(
                (error as Error).message || "Gagal mengupload gambar"
              );
              toast({
                title: "Gagal mengupload gambar",
                description:
                  (error as Error).message ||
                  "Terjadi kesalahan saat mengupload gambar",
                variant: "destructive",
              });
            } finally {
              setIsUploading(false);
              setUploadProgress(0);
            }
          }
        };
      };

      // Update toolbar configuration with new handler
      const toolbar = quill.getModule("toolbar") as {
        addHandler: (type: string, handler: () => void) => void;
      };
      toolbar.addHandler("image", imageHandler); // Add custom CSS for images with delete button
      const style = document.createElement("style");
      style.innerHTML = `
        .ql-editor img {
          display: block;
          max-width: 100%;
          margin: 1em 0;
          position: relative;
          transition: all 0.2s ease;
        }
        
        .ql-editor .image-container {
          position: relative;
          display: inline-block;
          margin: 1em 0;
        }
        
        .ql-editor .image-delete-button {
          position: absolute;
          top: 8px;
          right: 8px;
          background-color: rgba(255, 0, 0, 0.7);
          color: white;
          border: none;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 10;
          font-size: 14px;
        }
        
        .ql-editor .image-container:hover .image-delete-button {
          opacity: 1;
        }
        
        .ql-editor .image-container:hover img {
          filter: brightness(0.95);
        }
      `;
      document.head.appendChild(style);

      // Image interaction handling
      const enableImageDeleteButtons = () => {
        // Wait a bit for Quill to render the content
        setTimeout(() => {
          const editorElement = quill.root;
          const images = editorElement.querySelectorAll("img");

          // Clean up existing delete buttons first
          editorElement
            .querySelectorAll(".image-container")
            .forEach((container) => {
              // Get the image from the container
              const img = container.querySelector("img");
              if (img) {
                // Put the image back in the editor directly
                container.parentNode?.insertBefore(img, container);
                container.remove();
              }
            });

          // Add delete buttons to all images
          images.forEach((img) => {
            // Skip if image is already in a container
            if (img.parentElement?.classList.contains("image-container"))
              return;

            // Create container for the image and delete button
            const container = document.createElement("span");
            container.classList.add("image-container");

            // Create delete button
            const deleteBtn = document.createElement("button");
            deleteBtn.classList.add("image-delete-button");
            deleteBtn.innerHTML = "×"; // × character
            deleteBtn.setAttribute("type", "button");
            deleteBtn.title = "Hapus gambar";

            // Replace the image with the container
            img.parentNode?.insertBefore(container, img);
            container.appendChild(img);
            container.appendChild(deleteBtn);

            // Add event listener for delete button
            deleteBtn.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();

              // Show confirmation dialog
              if (
                window.confirm("Apakah Anda yakin ingin menghapus gambar ini?")
              ) {
                // Remove the container which contains the image
                const imgSrc = img.getAttribute("src");
                container.remove();

                // Update editor content
                onChangeRef.current?.(quill.root.innerHTML);

                // Show notification
                toast({
                  title: "Gambar dihapus",
                  description: "Gambar telah dihapus dari artikel",
                  variant: "default",
                });
              }
            });
          });
        }, 100);
      }; // Enhanced onChange handler with image delete button support
      quill.on(Quill.events.TEXT_CHANGE, () => {
        const htmlContent = quill.root.innerHTML;

        // Call the onChange prop with the new HTML content
        onChangeRef.current?.(htmlContent);

        // Add delete buttons to any images
        enableImageDeleteButtons();
      });

      // Also process initial content for images
      if (value) {
        setTimeout(() => enableImageDeleteButtons(), 200);
      }

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
        // Clean up the ref without doing any image deletion
        if (typeof ref === "function") {
          ref(null);
        } else if (ref) {
          ref.current = null;
        }
        container.innerHTML = "";
        style.remove();
      };
    }, [ref, value]);

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
          .upload-progress-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.9);
            padding: 1rem;
            border-radius: 0.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 100;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .upload-progress-bar {
            width: 200px;
            height: 10px;
            background-color: #f3f4f6;
            border-radius: 5px;
            margin: 10px 0;
            overflow: hidden;
          }
          .upload-progress-fill {
            height: 100%;
            background-color: #60a5fa;
            border-radius: 5px;
            transition: width 0.2s ease;
          }
        `}</style>
        <div ref={containerRef} className="h-full" />

        {/* Upload Progress Indicator */}
        {isUploading && (
          <div className="upload-progress-container">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mb-2" />
            <div className="text-sm font-medium">Mengupload gambar...</div>
            <div className="upload-progress-bar">
              <div
                className="upload-progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">{uploadProgress}%</div>
          </div>
        )}
      </div>
    );
  }
);

QuillEditor.displayName = "QuillEditor";

export default QuillEditor;
