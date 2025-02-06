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

const CollectionSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Nama koleksi terlalu pendek")
    .max(50, "Nama koleksi terlalu panjang")
    .required("Nama koleksi wajib diisi"),
});

export default function CollectionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const formik = useFormik({
    initialValues: { name: "" },
    validationSchema: CollectionSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      try {
        await addDoc(collection(db, "collections"), {
          name: values.name,
          createdAt: new Date(),
        });
        toast({
          title: "Koleksi berhasil ditambahkan",
          description: "Koleksi baru telah berhasil ditambahkan.",
        });
        resetForm();
      } catch (error) {
        console.error("Error adding collection:", error);
        toast({
          title: "Gagal menambahkan koleksi",
          description: "Terjadi kesalahan. Silakan coba lagi.",
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
        <CardTitle>Tambah Koleksi Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nama Koleksi</Label>
            <Input id="name" {...formik.getFieldProps("name")} />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-red-500 mt-1">{formik.errors.name}</p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting || !formik.isValid}>
            {isSubmitting ? "Menyimpan..." : "Simpan Koleksi"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
