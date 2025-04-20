"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCategoryStore } from "@/store/useCategoryStore";

/**
 * Props untuk komponen CategoryForm
 */
interface CategoryFormProps {
  /** Fungsi callback yang dipanggil setelah form berhasil disubmit */
  onSuccess?: () => void;
  /** Data awal untuk form (untuk mode edit) */
  initialData?: {
    id: string;
    name: string;
  };
}

/**
 * Komponen form untuk membuat atau mengupdate kategori
 */
export default function CategoryForm({
  onSuccess,
  initialData,
}: CategoryFormProps) {
  const { toast } = useToast();
  const { createCategory, updateCategory } = useCategoryStore();
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
        description: "Nama kategori tidak boleh kosong",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (initialData?.id) {
        // Mode edit
        await updateCategory(initialData.id, { name });
        toast({
          title: "Berhasil",
          description: "Kategori berhasil diperbarui",
        });
      } else {
        // Mode tambah
        await createCategory({ name });
        toast({
          title: "Berhasil",
          description: "Kategori berhasil dibuat",
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
        description: "Terjadi kesalahan saat menyimpan kategori",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Nama Kategori</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukkan nama kategori"
          disabled={isSubmitting}
          autoComplete="off"
        />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting
          ? "Menyimpan..."
          : initialData
          ? "Perbarui Kategori"
          : "Tambah Kategori"}
      </Button>
    </form>
  );
}
