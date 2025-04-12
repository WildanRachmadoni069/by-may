"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const CategorySchema = Yup.object().shape({
  label: Yup.string()
    .min(2, "Nama kategori terlalu pendek")
    .max(50, "Nama kategori terlalu panjang")
    .required("Nama kategori wajib diisi"),
  value: Yup.string()
    .min(2, "Value terlalu pendek")
    .max(50, "Value terlalu panjang")
    .matches(
      /^[a-z0-9-]+$/,
      "Value hanya boleh berisi huruf kecil, angka, dan tanda -"
    )
    .required("Value kategori wajib diisi"),
});

interface CategoryFormProps {
  onSuccess?: () => void;
}

export default function CategoryForm({ onSuccess }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const formik = useFormik({
    initialValues: { label: "", value: "" },
    validationSchema: CategorySchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      try {
        await addDoc(collection(db, "categories"), {
          label: values.label,
          value: values.value,
          createdAt: new Date(),
        });
        toast({
          title: "Kategori berhasil ditambahkan",
          description: "Kategori baru telah berhasil ditambahkan.",
        });
        resetForm();
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error("Error adding category:", error);
        toast({
          title: "Gagal menambahkan kategori",
          description: "Terjadi kesalahan. Silakan coba lagi.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Auto-generate value from label
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const label = e.target.value;
    formik.setFieldValue("label", label);

    // Generate value from label: lowercase, replace spaces with dashes
    const value = label.toLowerCase().replace(/\s+/g, "-");
    formik.setFieldValue("value", value);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="label">Nama Kategori</Label>
          <Input
            id="label"
            name="label"
            value={formik.values.label}
            onChange={handleLabelChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.label && formik.errors.label && (
            <p className="text-sm text-red-500 mt-1">{formik.errors.label}</p>
          )}
        </div>

        <div>
          <Label htmlFor="value">Value Kategori</Label>
          <Input id="value" {...formik.getFieldProps("value")} />
          {formik.touched.value && formik.errors.value && (
            <p className="text-sm text-red-500 mt-1">{formik.errors.value}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Value akan digunakan dalam URL dan sebagai identifier. Gunakan huruf
            kecil, angka, dan tanda - (tanpa spasi).
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !formik.isValid}
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Kategori"}
        </Button>
      </form>
    </div>
  );
}
