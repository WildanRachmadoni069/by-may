"use client";

import React from "react";
import "./image-upload-overlay.css";

interface EditorImageUploadOverlayProps {
  visible: boolean;
}

/**
 * Komponen overlay untuk menampilkan spinner saat sedang upload gambar di editor
 */
const EditorImageUploadOverlay: React.FC<EditorImageUploadOverlayProps> = ({
  visible,
}) => {
  if (!visible) return null;

  return (
    <div className="editor-image-upload-overlay">
      <div className="overlay-content">
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
        <div className="overlay-text">Mengupload gambar...</div>
      </div>
    </div>
  );
};

export default EditorImageUploadOverlay;
