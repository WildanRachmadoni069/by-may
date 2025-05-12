"use client";
import Quill from "quill";
import React, { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import "quill/dist/quill.snow.css";
import "./editor-styles.css";
import SimpleImageHandler from "./SimpleImageHandler";

interface MyEditorArticleProps {
  readOnly?: boolean;
  defaultValue?: any;
  onTextChange?: (...args: any[]) => void;
  onSelectionChange?: (...args: any[]) => void;
}

const MyEditorArticle = forwardRef<Quill, MyEditorArticleProps>(
  (
    { readOnly = false, defaultValue, onTextChange, onSelectionChange },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    });
    useEffect(() => {
      // Only try to enable/disable if ref has been initialized
      if (ref && typeof ref === "object" && ref.current) {
        ref.current.enable(!readOnly);
      }
    }, [ref, readOnly]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      const editorContainer = container.appendChild(
        container.ownerDocument.createElement("div")
      );

      // Konfigurasi Quill dengan toolbar yang lebih lengkap
      const quill = new Quill(editorContainer, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            ["blockquote", "code-block"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"],
          ],
        },
        placeholder: "Mulai menulis konten Anda di sini...",
      });

      // Handle the ref appropriately based on its type
      if (ref) {
        if (typeof ref === "function") {
          ref(quill);
        } else {
          ref.current = quill;
        }
      }

      if (defaultValueRef.current) {
        quill.setContents(defaultValueRef.current);
      }

      quill.on(Quill.events.TEXT_CHANGE, (...args) => {
        onTextChangeRef.current?.(...args);
      });

      quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
        onSelectionChangeRef.current?.(...args);
      });

      return () => {
        // Clean up the ref
        if (ref) {
          if (typeof ref === "function") {
            ref(null);
          } else {
            ref.current = null;
          }
        }
        container.innerHTML = "";
      };
    }, [ref]); // Store quill instance in a ref for SimpleImageHandler
    const quillRef = useRef<Quill | null>(null);

    useEffect(() => {
      // Update quillRef when ref is updated
      if (ref && typeof ref === "object" && ref.current) {
        quillRef.current = ref.current;
      }
    }, [ref]);

    return (
      <>
        <div
          ref={containerRef}
          className={`quill-editor-container ${
            readOnly ? "editor-readonly" : ""
          }`}
        />
        {quillRef.current && <SimpleImageHandler quill={quillRef.current} />}
      </>
    );
  }
);

// Add display name for better debugging
MyEditorArticle.displayName = "MyEditorArticle";

export default MyEditorArticle;
