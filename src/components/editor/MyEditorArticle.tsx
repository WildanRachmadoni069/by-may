"use client";

import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useLayoutEffect,
} from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { cn } from "@/lib/utils";

// Define toolbar options for article editing
const TOOLBAR_OPTIONS = [
  ["bold", "italic", "underline", "strike"], // text formatting
  [{ header: [1, 2, 3, 4, 5, 6, false] }], // headers
  [{ list: "ordered" }, { list: "bullet" }], // lists
  [{ script: "sub" }, { script: "super" }], // superscript/subscript
  [{ indent: "-1" }, { indent: "+1" }], // indentation
  [{ align: [] }], // text align
  ["blockquote", "code-block"], // blocks
  ["link", "image"], // links and images
  ["clean"], // remove formatting
];

interface MyEditorArticleProps {
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  onTextChange?: (delta: any, oldContents: any, source: any) => void;
  onSelectionChange?: (range: any, oldRange: any, source: any) => void;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
}

const MyEditorArticle = forwardRef<Quill, MyEditorArticleProps>(
  (
    {
      value,
      onChange,
      defaultValue,
      onTextChange,
      onSelectionChange,
      readOnly = false,
      placeholder = "Write your article content...",
      className = "",
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);
    const onChangeRef = useRef(onChange);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);
    const isUpdatingRef = useRef(false);
    const [isMounted, setIsMounted] = useState(false);

    // Update the callback refs when props change
    useLayoutEffect(() => {
      onChangeRef.current = onChange;
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    }, [onChange, onTextChange, onSelectionChange]);

    // Add custom styles and set mounted state
    useEffect(() => {
      setIsMounted(true);

      const styleEl = document.createElement("style");
      styleEl.textContent = `
        .ql-toolbar.ql-snow {
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          border-color: hsl(var(--input));
          background-color: hsl(var(--muted));
          border-bottom: 1px solid hsl(var(--border));
        }          .ql-container.ql-snow {
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
          border-color: hsl(var(--input));
          border-top: none;
          background-color: hsl(var(--background));
          display: flex;
          flex-direction: column;
          height: calc(100% - 42px); /* Toolbar height is approximately 42px */
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          margin: 0;
          padding: 0;
        }
          .ql-editor {
          font-family: inherit;
          height: 100% !important;
          overflow-y: auto;
          flex: 1;
          padding-bottom: 0;
          margin-bottom: 0;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        
        .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
        }
        
        .ql-editor:focus {
          outline: none;
        }
        
        .ql-formats button:hover {
          color: hsl(var(--primary));
        }
        
        .ql-formats .ql-active {
          color: hsl(var(--primary));
        }
          /* Fix for extra whitespace */
        .ql-container > div:not(.ql-editor) {
          display: none;
        }
          /* Fix for the container */
        .quill {
          height: 100% !important;
          display: flex;
          flex-direction: column;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        
        /* Remove extra spacing */
        .quill > .ql-container {
          margin-bottom: 0;
          padding-bottom: 0;
        }
        
        /* Make sure padding is controlled */
        .ql-editor p {
          margin-bottom: 0;
        }
        
        /* Fix for extra bottom space */
        .ql-editor > p:last-child {
          margin-bottom: 0;
        }
        
        /* Hide any overflow from the container */
        .ql-container.ql-snow > * {
          margin-bottom: 0;
          padding-bottom: 0;
        }
      `;
      document.head.appendChild(styleEl);

      return () => {
        document.head.removeChild(styleEl);
        setIsMounted(false);
      };
    }, []);

    // Initialize Quill
    useEffect(() => {
      if (!isMounted || !containerRef.current) return;

      // Create the editor container
      const editorContainer = containerRef.current.appendChild(
        document.createElement("div")
      );

      // Create the Quill instance
      const quill = new Quill(editorContainer, {
        modules: {
          toolbar: TOOLBAR_OPTIONS,
        },
        placeholder,
        readOnly,
        theme: "snow",
      });

      // Set initial content from either value or defaultValue
      if (value) {
        quill.clipboard.dangerouslyPasteHTML(value);
      } else if (defaultValue) {
        quill.clipboard.dangerouslyPasteHTML(defaultValue);
      }

      // Handle text change events
      quill.on("text-change", (delta, oldContents, source) => {
        if (onTextChangeRef.current) {
          onTextChangeRef.current(delta, oldContents, source);
        }

        if (onChangeRef.current && !isUpdatingRef.current) {
          const content = quill.root.innerHTML;
          onChangeRef.current(content);
        }
      });

      // Handle selection change events
      quill.on("selection-change", (range, oldRange, source) => {
        if (onSelectionChangeRef.current) {
          onSelectionChangeRef.current(range, oldRange, source);
        }
      });

      // Store the Quill instance
      quillRef.current = quill;

      // Expose the editor instance via ref
      if (typeof ref === "function") {
        ref(quill);
      } else if (ref) {
        ref.current = quill;
      }

      // Cleanup
      return () => {
        if (typeof ref === "function") {
          ref(null);
        } else if (ref) {
          ref.current = null;
        }
        quillRef.current = null;
        containerRef.current!.innerHTML = "";
      };
    }, [isMounted, placeholder, readOnly, defaultValue]);

    // Update content when value prop changes
    useEffect(() => {
      if (quillRef.current && value !== undefined && isMounted) {
        const quill = quillRef.current;
        const currentContent = quill.root.innerHTML;

        // Only update if the value is different
        if (currentContent !== value) {
          isUpdatingRef.current = true;
          quill.clipboard.dangerouslyPasteHTML(value);
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 0);
        }
      }
    }, [value, isMounted]);

    // Update read-only state
    useEffect(() => {
      if (quillRef.current) {
        quillRef.current.enable(!readOnly);
      }
    }, [readOnly]);
    return (
      <div
        className={cn(
          "relative rounded-md border border-input bg-transparent shadow-sm",
          readOnly ? "opacity-70 cursor-not-allowed" : "",
          className
        )}
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        <div
          ref={containerRef}
          className="h-full w-full"
          style={{ position: "relative" }}
        >
          {/* Quill will inject the editor here */}
        </div>
      </div>
    );
  }
);

MyEditorArticle.displayName = "MyEditorArticle";

export default MyEditorArticle;
