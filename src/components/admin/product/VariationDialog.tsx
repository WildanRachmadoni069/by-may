"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageUploadPreview from "./ImageUploadPreview";
import { X } from "lucide-react";

interface VariationOption {
  id: string;
  name: string;
  imageBase64?: string;
}

interface VariationDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, options: VariationOption[]) => void;
  allowImages?: boolean;
  initialData?: {
    name: string;
    options: VariationOption[];
  };
}

export default function VariationDialog({
  open,
  onClose,
  onSave,
  allowImages = false,
  initialData,
}: VariationDialogProps) {
  const [name, setName] = useState("");
  const [options, setOptions] = useState<VariationOption[]>([]);
  const [newOption, setNewOption] = useState("");

  useEffect(() => {
    if (!open) {
      setName("");
      setOptions([]);
      setNewOption("");
    } else if (initialData) {
      setName(initialData.name);
      setOptions(initialData.options);
    }
  }, [open, initialData]);

  const handleAddOption = () => {
    if (newOption.trim()) {
      setOptions([
        ...options,
        { id: Date.now().toString(), name: newOption.trim() },
      ]);
      setNewOption("");
    }
  };

  const handleRemoveOption = (id: string) => {
    setOptions(options.filter((option) => option.id !== id));
  };

  const handleImageChange = (id: string, base64: string | null) => {
    setOptions(
      options.map((option) =>
        option.id === id
          ? { ...option, imageBase64: base64 || undefined }
          : option
      )
    );
  };

  const handleSave = () => {
    if (name && options.length > 0) {
      onSave(name, options);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Variasi</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nama Variasi</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Warna, Ukuran"
            />
          </div>
          <div>
            <Label>Tambah Opsi</Label>
            <div className="flex gap-2">
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Masukkan opsi baru"
              />
              <Button onClick={handleAddOption}>Tambah</Button>
            </div>
          </div>
          <div className="space-y-2">
            {options.map((option) => (
              <div
                key={option.id}
                className="flex items-center gap-2 p-2 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{option.name}</p>
                </div>
                {allowImages && (
                  <div className="w-24">
                    <ImageUploadPreview
                      value={option.imageBase64}
                      onChange={(base64) =>
                        handleImageChange(option.id, base64)
                      }
                      id={`variation-image-${option.id}`}
                    />
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveOption(option.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
