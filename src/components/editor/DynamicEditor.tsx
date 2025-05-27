"use client";

import dynamic from "next/dynamic";

// Import the editor component with dynamic import to prevent server-side loading
const MyEditorArticle = dynamic(() => import("./MyEditorArticle"), {
  ssr: false, // This is critical - prevents server-side rendering
  loading: () => (
    <div className="w-full h-[300px] bg-slate-100 animate-pulse rounded-md"></div>
  ),
});

export default MyEditorArticle;
