import useSWRMutation from "swr/mutation";
import { useState } from "react";

interface UploadImageOptions {
  folder?: string;
  tags?: string;
  upload_preset?: string;
  resource_type?: string;
}

async function uploadImageFetcher(
  url: string,
  { arg }: { arg: { file: File; options?: UploadImageOptions } }
) {
  const { file, options = {} } = arg;
  const formData = new FormData();

  formData.append("file", file);

  // Selalu gunakan upload_preset untuk editor artikel
  formData.append("upload_preset", options.upload_preset || "article_content");

  // Tambahkan opsi lain jika ada
  if (options.folder) formData.append("folder", options.folder);
  if (options.tags) formData.append("tags", options.tags);
  if (options.resource_type)
    formData.append("resource_type", options.resource_type);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Gagal mengunggah gambar");
  }

  return response.json();
}

export function useEditorImageUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const { trigger, isMutating, error, data, reset } = useSWRMutation(
    "/api/cloudinary/upload",
    uploadImageFetcher
  );

  // Fungsi untuk upload gambar dengan handler khusus untuk editor
  const uploadImage = async (file: File, options: UploadImageOptions = {}) => {
    try {
      setIsUploading(true);

      // Pastikan upload_preset untuk artikel selalu digunakan
      const uploadOptions = {
        ...options,
        upload_preset: "article_content",
      };

      const result = await trigger({ file, options: uploadOptions });
      return result;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading: isUploading || isMutating,
    error,
    data,
    reset,
  };
}
