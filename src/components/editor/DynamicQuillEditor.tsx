"use client";

import dynamic from "next/dynamic";

// Import the editor component with dynamic import to prevent server-side loading
const QuillEditor = dynamic(() => import("./ProductDescriptionEditor"), {
  ssr: false, // This is critical - prevents server-side rendering
  loading: () => (
    <div className="w-full h-[250px] bg-slate-100 animate-pulse rounded-md"></div>
  ),
});

export default QuillEditor;
