"use client";
import React, { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface ProductDescriptionEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
}

const ProductDescriptionEditor = forwardRef<
  Quill,
  ProductDescriptionEditorProps
>(({ value, onChange, readOnly = false, className = "" }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);

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
            [{ header: [1, 2, 3, false] }], // Specify size options
            [{ align: [] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ color: [] }],
            ["clean"],
          ],
        },
        clipboard: {
          matchVisual: false,
        },
      },
      formats: [
        "size", // Add size to allowed formats
        "align",
        "bold",
        "italic",
        "underline",
        "strike",
        "list",
        "color",
        "indent", // Tambahkan format indent
      ],
    });

    // Existing change handler
    quill.on(Quill.events.TEXT_CHANGE, () => {
      onChangeRef.current?.(quill.root.innerHTML);
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
      if (typeof ref === "function") {
        ref(null);
      } else if (ref) {
        ref.current = null;
      }
      container.innerHTML = "";
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
          min-height: 150px;
          max-height: 300px;
          overflow-y: auto;
        }
      `}</style>
      <div ref={containerRef} className="h-full" />
    </div>
  );
});

ProductDescriptionEditor.displayName = "ProductDescriptionEditor";

export default ProductDescriptionEditor;
