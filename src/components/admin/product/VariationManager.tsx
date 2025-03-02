import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  X,
  Pencil,
  Trash2,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Save,
  Ban,
} from "lucide-react";
import ImageUploadPreview from "./ImageUploadPreview";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ProductOption,
  ProductVariation,
  VariationFormData,
  VariationFormOption,
} from "@/types/product";
import { generateMeaningfulId } from "@/lib/utils";
import Image from "next/image";

interface VariationManagerProps {
  variations: ProductVariation[];
  onAddVariation: (variation: ProductVariation) => void;
  onUpdateVariation: (index: number, variation: ProductVariation) => void;
  onRemoveVariation: (index: number) => void;
  onGenerateCombinations: () => void;
  disabled?: boolean;
}

export function VariationManager({
  variations,
  onAddVariation,
  onUpdateVariation,
  onRemoveVariation,
  onGenerateCombinations,
  disabled = false,
}: VariationManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<VariationFormData>({
    name: "",
    options: [{ id: generateMeaningfulId("option"), name: "", imageUrl: null }],
  });

  const isFirstVariation = variations.length === 0 || editingIndex === 0;
  const showImageUpload = isFirstVariation;

  const handleAddOption = () => {
    const newOption: VariationFormOption = isFirstVariation
      ? { id: generateMeaningfulId("option"), name: "", imageUrl: null }
      : { id: generateMeaningfulId("option"), name: "" };

    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, newOption],
    }));
  };

  const handleRemoveOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleEditVariation = (index: number) => {
    const variation = variations[index];
    const options: VariationFormOption[] = variation.options.map((option) => ({
      id: option.id,
      name: option.name,
      imageUrl: option.imageUrl,
    }));

    setFormData({
      name: variation.name,
      options,
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleSaveVariation = () => {
    if (!formData.name || formData.options.some((opt) => !opt.name)) {
      return; // Validation failed
    }

    // Process options to ensure proper imageUrl handling
    let processedOptions: ProductOption[] = formData.options.map((option) => {
      if (isFirstVariation) {
        return {
          id: option.id,
          name: option.name,
          imageUrl: option.imageUrl === null ? undefined : option.imageUrl,
        };
      } else {
        return {
          id: option.id,
          name: option.name,
        };
      }
    });

    if (editingIndex !== null) {
      // Update existing variation
      onUpdateVariation(editingIndex, {
        id: variations[editingIndex].id,
        name: formData.name,
        options: processedOptions,
      });
    } else {
      // Add new variation
      onAddVariation({
        id: generateMeaningfulId(`var-${formData.name}`),
        name: formData.name,
        options: processedOptions,
      });
    }

    // Reset form
    resetForm();
  };

  const resetForm = () => {
    const initialOption: VariationFormOption =
      variations.length === 0
        ? { id: generateMeaningfulId("option"), name: "", imageUrl: null }
        : { id: generateMeaningfulId("option"), name: "" };

    setFormData({
      name: "",
      options: [initialOption],
    });
    setShowForm(false);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-5">
      {/* Variation List */}
      {variations.length > 0 && (
        <Accordion
          type="single"
          collapsible
          defaultValue="variations"
          className="mb-6"
        >
          <AccordionItem value="variations">
            <AccordionTrigger className="py-2 px-3 bg-muted/40 rounded-t-md font-medium">
              <span className="flex items-center">
                Variasi yang Sudah Ditambahkan ({variations.length})
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-1 px-0">
              <div className="grid gap-4 p-1">
                {variations.map((variation, index) => (
                  <Card
                    key={variation.id}
                    className={`shadow-sm border-l-4 ${
                      index === 0
                        ? "border-l-primary"
                        : "border-l-muted-foreground"
                    }`}
                  >
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg leading-none">
                            {variation.name}
                          </h3>
                          {index === 0 && (
                            <Badge variant="outline" className="text-xs">
                              Dengan Gambar
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {variation.options.length} opsi
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditVariation(index)}
                                disabled={disabled || showForm}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Variasi</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onRemoveVariation(index)}
                                disabled={disabled || showForm}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Hapus Variasi</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="flex flex-wrap gap-2 mt-2">
                        {variation.options.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-center bg-muted/80 hover:bg-muted px-2 py-1.5 rounded-md text-sm transition-colors"
                          >
                            {index === 0 && option.imageUrl && (
                              <div className="relative h-6 w-6 mr-2 rounded-sm overflow-hidden">
                                <Image
                                  src={option.imageUrl}
                                  alt={option.name || "Option image"}
                                  fill
                                  className="object-cover"
                                  sizes="24px"
                                />
                              </div>
                            )}
                            {index === 0 && !option.imageUrl && (
                              <ImageIcon className="h-4 w-4 mr-1.5 text-muted-foreground" />
                            )}
                            <span>{option.name}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Empty State */}
      {variations.length === 0 && !showForm && (
        <div className="bg-muted/30 border border-dashed border-muted-foreground/30 rounded-md p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-medium text-lg mb-2">Belum Ada Variasi Produk</h3>
          <p className="text-muted-foreground mb-4">
            Tambahkan variasi untuk produk dengan beberapa pilihan seperti
            ukuran atau warna
          </p>
          <Button onClick={() => setShowForm(true)}>
            Buat Variasi Pertama
          </Button>
        </div>
      )}

      {/* Add Second Variation Button */}
      {variations.length === 1 && !showForm && (
        <div className="text-center pb-2">
          <Button
            variant="outline"
            onClick={() => setShowForm(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Variasi Kedua
          </Button>
        </div>
      )}

      {/* Variation Form */}
      {showForm && (
        <Card className="border-l-4 border-l-blue-500 shadow-md">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle>
              {editingIndex !== null
                ? `Edit Variasi: ${formData.name}`
                : "Buat Variasi Baru"}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="h-4 w-4 mr-1" />
              Batal
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="variation-name" className="text-base font-medium">
                Nama Variasi
              </Label>
              <div className="mt-1.5">
                <Input
                  id="variation-name"
                  placeholder="Contoh: Ukuran, Warna, Model"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="text-base"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label className="text-base font-medium">Opsi Variasi</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  className="h-8 px-2 text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Tambah Opsi
                </Button>
              </div>

              <div className="space-y-3 mt-2">
                {formData.options.map((option, index) => (
                  <div
                    key={option.id}
                    className="space-y-2 bg-muted/20 p-3 rounded-md relative"
                  >
                    <div className="flex gap-2">
                      <Input
                        value={option.name}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[index].name = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            options: newOptions,
                          }));
                        }}
                        placeholder={`Nama opsi ${index + 1}`}
                        className="flex-grow"
                      />
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOption(index)}
                          className="absolute top-2 right-2 h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Image upload for first variation options */}
                    {showImageUpload && (
                      <div className="ml-0">
                        <Label className="text-sm mb-1.5 inline-block">
                          Foto Opsi
                        </Label>
                        <div className="flex items-start">
                          <ImageUploadPreview
                            value={option.imageUrl}
                            onChange={(url) => {
                              const newOptions = [...formData.options];
                              newOptions[index] = {
                                ...newOptions[index],
                                imageUrl: url || undefined,
                              };
                              setFormData((prev) => ({
                                ...prev,
                                options: newOptions,
                              }));
                            }}
                            className="max-w-[100px]"
                            id={`option-image-${option.id}`}
                          />
                          <div className="text-xs text-muted-foreground ml-3 mt-1">
                            <p>• Gambar akan tampil di halaman produk</p>
                            <p>• Gunakan gambar dengan ukuran seragam</p>
                            <p>• Optimal: 500x500 piksel</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={handleSaveVariation}
                className="gap-1.5"
              >
                <Save className="h-4 w-4" />
                {editingIndex !== null ? "Perbarui Variasi" : "Simpan Variasi"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                <Ban className="h-4 w-4 mr-1" />
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
