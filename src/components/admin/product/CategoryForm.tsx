"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

interface CategoryFormData {
  name: string;
}

const CategorySchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Nama kategori terlalu pendek")
    .max(50, "Nama kategori terlalu panjang")
    .required("Nama kategori wajib diisi"),
});

function CategoryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const formik = useFormik<CategoryFormData>({
    initialValues: {
      name: "",
    },
    validationSchema: CategorySchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      try {
        await addDoc(collection(db, "categories"), {
          name: values.name,
          createdAt: new Date(),
        });
        toast({
          title: "Kategori berhasil ditambahkan",
          description: "Kategori baru telah berhasil ditambahkan ke database.",
        });
        resetForm();
      } catch (error) {
        console.error("Error adding category:", error);
        toast({
          title: "Gagal menambahkan kategori",
          description:
            "Terjadi kesalahan saat menambahkan kategori. Silakan coba lagi.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Kategori Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nama Kategori</Label>
            <Input id="name" {...formik.getFieldProps("name")} />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-red-500 mt-1">{formik.errors.name}</p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting || !formik.isValid}>
            {isSubmitting ? "Menyimpan..." : "Simpan Kategori"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default CategoryForm;
