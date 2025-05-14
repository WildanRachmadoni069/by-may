import useSWRMutation from "swr/mutation";
import { useState } from "react";

// Fungsi fetcher untuk delete image
async function deleteImageFetcher(
  url: string,
  { arg }: { arg: { publicId?: string; imageUrl?: string } }
) {
  const { publicId, imageUrl } = arg;

  // Cek jika ada parameter yang diperlukan
  if (!publicId && !imageUrl) {
    throw new Error("Diperlukan publicId atau imageUrl untuk menghapus gambar");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      publicId,
      url: imageUrl,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Gagal menghapus gambar");
  }

  return response.json();
}

export function useEditorImageDelete() {
  const [isDeleting, setIsDeleting] = useState(false);

  const { trigger, isMutating, error, data, reset } = useSWRMutation(
    "/api/cloudinary/delete",
    deleteImageFetcher
  );
  // Fungsi untuk menghapus gambar berdasarkan URL
  const deleteImageByUrl = async (imageUrl: string) => {
    try {
      setIsDeleting(true);
      console.log("[useEditorImageDelete] Deleting image by URL:", imageUrl);

      const result = await trigger({ imageUrl });
      console.log("[useEditorImageDelete] Delete result:", result);

      return result;
    } catch (error) {
      console.error(
        "[useEditorImageDelete] Error deleting image by URL:",
        error
      );
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  // Fungsi untuk menghapus gambar berdasarkan publicId
  const deleteImageByPublicId = async (publicId: string) => {
    try {
      setIsDeleting(true);
      const result = await trigger({ publicId });
      return result;
    } catch (error) {
      console.error("Error deleting image by publicId:", error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteImageByUrl,
    deleteImageByPublicId,
    isDeleting: isDeleting || isMutating,
    error,
    data,
    reset,
  };
}
