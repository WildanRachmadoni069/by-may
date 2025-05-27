"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCollectionStore } from "@/store/useCollectionStore";

/**
 * Props untuk komponen CollectionForm
 */
interface CollectionFormProps {
  /** Fungsi callback yang dipanggil setelah form berhasil disubmit */
  onSuccess?: () => void;
  /** Data awal untuk form (untuk mode edit) */
  initialData?: {
    id: string;
    name: string;
  };
}

/**
 * Komponen form untuk membuat atau mengupdate koleksi
 */
export default function CollectionForm({
  onSuccess,
  initialData,
}: CollectionFormProps) {
  const { toast } = useToast();
  const { createCollection, updateCollection } = useCollectionStore();
  const [name, setName] = useState(initialData?.name || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Menangani submit form
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Nama koleksi tidak boleh kosong",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (initialData?.id) {
        // Mode edit
        await updateCollection(initialData.id, { name });
        toast({
          title: "Berhasil",
          description: "Koleksi berhasil diperbarui",
        });
      } else {
        // Mode tambah
        await createCollection({ name });
        toast({
          title: "Berhasil",
          description: "Koleksi berhasil dibuat",
        });
        setName("");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan koleksi",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Nama Koleksi</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukkan nama koleksi"
          disabled={isSubmitting}
          autoComplete="off"
        />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting
          ? "Menyimpan..."
          : initialData
          ? "Perbarui Koleksi"
          : "Tambah Koleksi"}
      </Button>
    </form>
  );
}
