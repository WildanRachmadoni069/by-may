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
  [{ header: [1, 2, false] }], // headers
  ["bold", "italic", "underline", "strike"], // text formatting
  [{ list: "ordered" }, { list: "bullet" }], // lists
  [{ indent: "-1" }, { indent: "+1" }], // indentation
  [{ align: [] }], // text align
  ["blockquote", "link", "image"], // common elements
  ["clean"], // remove formatting
];

// Mobile-optimized toolbar designed for wrapping layout
const TOOLBAR_OPTIONS_MOBILE = [
  [{ header: [false, "1", "2"] }], // Headers in its own group
  ["bold", "italic", "underline", "strike"], // Text formatting
  [{ list: "ordered" }, { list: "bullet" }], // Lists
  [{ indent: "-1" }, { indent: "+1" }, { align: [] }], // Indentation and alignment
  ["blockquote", "link", "image", "clean"], // Common elements
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
  height?: string | number;
  maxHeight?: string | number;
  minHeight?: string | number;
  fullWidth?: boolean;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "ghost";
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
      height,
      maxHeight = "500px",
      minHeight = "200px",
      fullWidth = true,
      size = "default",
      variant = "default",
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
    const [isMobile, setIsMobile] = useState(false);

    // Update the callback refs when props change
    useLayoutEffect(() => {
      onChangeRef.current = onChange;
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    }, [onChange, onTextChange, onSelectionChange]); // Check for mobile viewport
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768); // Standard breakpoint for tablets
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);

      return () => {
        window.removeEventListener("resize", checkMobile);
      };
    }, []);

    // Add custom styles and set mounted state
    useEffect(() => {
      setIsMounted(true);

      const styleEl = document.createElement("style");
      styleEl.textContent = `        /* Base Toolbar Styles */
        .ql-toolbar.ql-snow {
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          border-color: hsl(var(--input));
          background-color: hsl(var(--muted));
          border-bottom: 1px solid hsl(var(--border));
          padding: 8px;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          overflow-x: visible;
          min-height: 44px;
        }

        /* Toolbar Size Variants */
        .editor-sm .ql-toolbar.ql-snow {
          padding: 4px;
        }
        
        .editor-lg .ql-toolbar.ql-snow {
          padding: 12px;
        }
        
        /* Toolbar Button Spacing */
        .ql-toolbar.ql-snow .ql-formats {
          margin-right: 10px;
          margin-bottom: 5px;
        }
          /* Mobile Toolbar Optimization */
        @media (max-width: 767px) {
          .ql-toolbar.ql-snow {
            padding: 6px 4px;
            justify-content: center;
            flex-wrap: wrap;
            overflow-x: visible;
            min-height: auto;
            height: auto;
          }
          
          .ql-toolbar.ql-snow .ql-formats {
            margin-right: 5px;
            margin-bottom: 5px;
            display: flex;
            flex-wrap: nowrap;
            height: 36px;
            align-items: center;
          }
        }
        
        /* Container Styles */
        .ql-container.ql-snow {
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
        
        /* Variant Styles */
        .editor-outline .ql-toolbar.ql-snow,
        .editor-outline .ql-container.ql-snow {
          border-color: hsl(var(--border));
          background-color: transparent;
        }
        
        .editor-ghost .ql-toolbar.ql-snow,
        .editor-ghost .ql-container.ql-snow {
          border-color: transparent;
          background-color: transparent;
        }
        
        /* Editor Content Area */
        .ql-editor {
          font-family: inherit;
          height: 100% !important;
          overflow-y: auto;
          flex: 1;
          padding: 12px 16px;
          padding-bottom: 16px !important;
          margin-bottom: 0;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          color: hsl(var(--foreground));
          font-size: 1rem;
          line-height: 1.6;
        }
        
        /* Editor Size Variants */
        .editor-sm .ql-editor {
          padding: 8px 12px;
          font-size: 0.875rem;
        }
        
        .editor-lg .ql-editor {
          padding: 16px 20px;
          font-size: 1.125rem;
        }
          /* Placeholder Text */
        .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
          opacity: 0.7;
        }
        
        /* Focus State */
        .ql-editor:focus {
          outline: none;
        }
        
        /* Toolbar Buttons */
        .ql-formats button {
          width: 28px;
          height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .ql-formats button:hover {
          color: hsl(var(--primary));
          background-color: hsl(var(--accent) / 0.2);
        }
        
        .ql-formats .ql-active {
          color: hsl(var(--primary));
          background-color: hsl(var(--accent) / 0.3);
        }
        
        /* Fix for align picker size */
        .ql-formats .ql-align {
          width: 28px !important;
          height: 28px !important;
        }
        
        .ql-formats .ql-align .ql-picker-label {
          display: flex;
          align-items: center;
          justify-content: center;
          padding-right: 0;
          width: 28px !important;
          height: 28px !important;
        }
        
        .ql-formats .ql-align .ql-picker-label svg {
          right: 0;
          position: relative;
          margin: 0 auto;
        }
        
        .ql-formats .ql-align .ql-picker-label::before {
          content: none;
        }
        
          /* Mobile Toolbar Buttons */
        @media (max-width: 767px) {
          .ql-formats button, 
          .ql-formats .ql-picker {
            width: 28px;
            height: 28px;
            padding: 0;
            margin: 0 2px;
          }
          
          .ql-formats .ql-picker {
            width: auto;
            min-width: 50px;
          }
          
          /* Fix align picker on mobile */
          .ql-formats .ql-align {
            width: 28px !important;
            min-width: 28px !important;
          }
          
          /* Position picker dropdown better */
          .ql-formats .ql-picker .ql-picker-options {
            min-width: 120px;
            max-height: 200px;
            overflow-y: auto;
          }
          
          /* Ensure dropdown is visible above content */
          .ql-picker-options {
            z-index: 20;
          }
        }
        
        /* Fix for extra whitespace */
        .ql-container > div:not(.ql-editor) {
          display: none;
        }          /* Fix for the container */
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
        
        /* Typography within editor */
        .ql-editor p {
          margin-bottom: 0.75em;
        }
        
        .ql-editor h1 {
          font-size: 1.875rem;
          font-weight: 600;
          margin-top: 1em;
          margin-bottom: 0.5em;
          color: hsl(var(--foreground));
        }
        
        .ql-editor h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1em;
          margin-bottom: 0.5em;
          color: hsl(var(--foreground));
        }
        
        .ql-editor h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1em;
          margin-bottom: 0.5em;
          color: hsl(var(--foreground));
        }
        
        .ql-editor blockquote {
          border-left: 4px solid hsl(var(--border));
          padding-left: 1rem;
          margin-left: 0;
          margin-right: 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }
        
        .ql-editor a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
        
        /* Fix for extra bottom space */
        .ql-editor > p:last-child {
          margin-bottom: 1em;
        }
        
        /* Hide any overflow from the container */
        .ql-container.ql-snow > * {
          margin-bottom: 0;
          padding-bottom: 0;
        }
        
        /* Responsive adjustments */
        @media (max-width: 767px) {
          .quill .ql-editor {
            padding: 10px 12px;
          }
          
          .ql-editor h1 {
            font-size: 1.5rem;
          }
          
          .ql-editor h2 {
            font-size: 1.25rem;
          }
          
          .ql-editor h3 {
            font-size: 1.125rem;
          }
        }

        /* Adjust container height for mobile when toolbar wraps */
        @media (max-width: 767px) {
          .ql-container.ql-snow {
            height: calc(100% - 100px); /* Adjust based on wrapped toolbar height */
          }
          
          /* For very small screens */
          @media (max-width: 480px) {
            .ql-container.ql-snow {
              height: calc(100% - 140px); /* Even more space for toolbar */
            }
          }
        }
      `;
      document.head.appendChild(styleEl);

      return () => {
        document.head.removeChild(styleEl);
        setIsMounted(false);
      };
    }, []); // Initialize Quill
    useEffect(() => {
      if (!isMounted || !containerRef.current) return;

      // Create the editor container
      const editorContainer = containerRef.current.appendChild(
        document.createElement("div")
      ); // Create the Quill instance with appropriate toolbar for device
      const quill = new Quill(editorContainer, {
        modules: {
          toolbar: {
            container: isMobile ? TOOLBAR_OPTIONS_MOBILE : TOOLBAR_OPTIONS,
          },
          history: {
            delay: 1000,
            maxStack: 100,
            userOnly: true,
          },
        },
        placeholder,
        readOnly,
        theme: "snow",
      }); // No need for toolbar scroll feature for mobile anymore as we're using wrapping
      if (isMobile && containerRef.current) {
        const toolbar = containerRef.current.querySelector(
          ".ql-toolbar"
        ) as HTMLElement;
        if (toolbar) {
          // Use a MutationObserver to adjust container height based on toolbar height
          const observer = new MutationObserver(() => {
            const toolbarHeight = toolbar.offsetHeight;
            const container = containerRef.current?.querySelector(
              ".ql-container"
            ) as HTMLElement;
            if (container) {
              container.style.height = `calc(100% - ${toolbarHeight}px)`;
            }
          });

          observer.observe(toolbar, {
            attributes: true,
            childList: true,
            subtree: true,
          });
        }
      }

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
    }, [readOnly]); // Generate container style based on props
    const containerStyle = {
      display: "flex",
      flexDirection: "column" as const,
      height: height || "100%",
      minHeight: minHeight,
      maxHeight: maxHeight,
      width: fullWidth ? "100%" : "auto",
    };

    // Determine editor class based on size and variant
    const editorSizeClass = `editor-${size}`;
    const editorVariantClass = `editor-${variant}`;
    return (
      <div
        className={cn(
          "relative rounded-md border border-input bg-transparent shadow-sm transition-colors",
          readOnly ? "opacity-70 cursor-not-allowed" : "",
          isMobile ? "mobile-editor-container" : "",
          editorSizeClass,
          editorVariantClass,
          className
        )}
        style={containerStyle}
      >
        <div
          ref={containerRef}
          className="h-full w-full"
          style={{ position: "relative" }}
        >
          {/* Quill will inject the editor here */}
        </div>

        {/* Responsive indicator for debugging */}
        {process.env.NODE_ENV === "development" && (
          <div className="absolute right-2 bottom-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm hidden md:block">
            {isMobile ? "Mobile" : "Desktop"}
          </div>
        )}
      </div>
    );
  }
);

MyEditorArticle.displayName = "MyEditorArticle";

export default MyEditorArticle;
