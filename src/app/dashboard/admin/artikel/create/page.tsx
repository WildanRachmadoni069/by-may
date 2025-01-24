"use client";
import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import LabelWithTooltip from "@/components/general/LabelWithTooltip";
import GoogleSearchPreview from "@/components/general/GoogleSearchPreview";
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

import FeaturedImageArticle from "@/components/admin/article/FeaturedImageArticle";

const validationSchema = Yup.object({
  title: Yup.string().required("Judul wajib diisi"),
  slug: Yup.string().required("Slug wajib diisi"),
  content: Yup.string().required("Konten wajib diisi"),
  excerpt: Yup.string().required("Ringkasan wajib diisi"),
  featured_image: Yup.object({
    url: Yup.string()
      .url("URL tidak valid")
      .required("Gambar utama wajib diisi"),
    alt: Yup.string().required("Teks alt wajib diisi"),
  }),
  status: Yup.string().oneOf(["draft", "published"]).required(),
  meta: Yup.object({
    title: Yup.string().required("Meta title wajib diisi"),
    description: Yup.string().required("Meta description wajib diisi"),
    og_image: Yup.string().url("URL tidak valid"),
  }),
});

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/-+/g, "-") // Replace multiple - with single -
    .trim(); // Trim - from start and end
};

const generateExcerpt = (content: string): string => {
  // Add space before closing HTML tags
  const textWithSpaces = content.replace(/<\//g, " </");

  // Remove HTML tags and get plain text
  const plainText = textWithSpaces
    .replace(/<[^>]+>/g, "") // Remove HTML tags
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/\n+/g, " ") // Replace line breaks with space
    .trim(); // Remove leading/trailing spaces

  // Get first 150 characters and add ellipsis if needed
  return plainText.length > 150
    ? `${plainText.substring(0, 150)}...`
    : plainText;
};

// Update character count component to be more flexible
const CharacterCountSEO = ({
  current,
  type = "title",
}: {
  current: number;
  type?: "title" | "description";
}) => {
  const limit = type === "title" ? 60 : 160;

  const getColor = () => {
    if (current === 0) return "text-gray-500";
    if (current <= limit) return "text-green-500";
    return "text-red-500";
  };

  const getMessage = () => {
    if (current === 0)
      return type === "title"
        ? "Judul meta belum diisi"
        : "Deskripsi meta belum diisi";
    if (current <= limit) return "Panjang teks sudah baik";
    return type === "title"
      ? "Judul terlalu panjang"
      : "Deskripsi terlalu panjang";
  };

  return (
    <div className="flex justify-between text-xs">
      <span className={getColor()}>{getMessage()}</span>
      <span className={getColor()}>
        {current}/{limit} karakter
      </span>
    </div>
  );
};

export default function ArticleCreatePage() {
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      featured_image: { url: "", alt: "" },
      status: "draft",
      meta: { title: "", description: "", og_image: "" },
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Add your API call here
        console.log(values);
        router.push("/dashboard/admin/artikel");
      } catch (error) {
        console.error("Error creating article:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Add effect to auto-generate slug when title changes
  React.useEffect(() => {
    const slug = generateSlug(formik.values.title);
    formik.setFieldValue("slug", slug);
  }, [formik.values.title]);

  // Add effect to auto-generate excerpt when content changes
  React.useEffect(() => {
    const excerpt = generateExcerpt(formik.values.content);
    formik.setFieldValue("excerpt", excerpt);
  }, [formik.values.content]);

  // Add effect to sync featured image URL to og_image
  React.useEffect(() => {
    if (formik.values.featured_image.url) {
      formik.setFieldValue("meta.og_image", formik.values.featured_image.url);
    }
  }, [formik.values.featured_image.url]);

  // Add effect to sync title to meta title if meta title is empty
  React.useEffect(() => {
    if (!formik.values.meta.title) {
      formik.setFieldValue("meta.title", formik.values.title);
    }
  }, [formik.values.title]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <LabelWithTooltip
                htmlFor="title"
                label="Judul"
                tooltip="Judul artikel yang akan ditampilkan sebagai headline. Pastikan menarik dan informatif."
              />
              <Input id="title" {...formik.getFieldProps("title")} />
              {formik.touched.title && formik.errors.title && (
                <p className="text-sm text-red-500">{formik.errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <LabelWithTooltip
                htmlFor="slug"
                label="Slug (Otomatis)"
                tooltip="URL ramah yang dibuat otomatis dari judul artikel."
              />
              <Input
                disabled
                id="slug"
                {...formik.getFieldProps("slug")}
                readOnly
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <LabelWithTooltip
                htmlFor="content"
                label="Konten"
                tooltip="Isi utama artikel. Gunakan editor untuk memformat teks, menambah gambar, dan mengatur layout."
              />
              <div className="h-64">
                <ReactQuill
                  theme="snow"
                  value={formik.values.content}
                  onChange={(value) => formik.setFieldValue("content", value)}
                  className="h-48"
                  modules={{
                    toolbar: [
                      [{ header: [2, 3, false] }],
                      [
                        {
                          align: [],
                        },
                      ],
                      [{ indent: "-1" }, { indent: "+1" }],
                      [{ color: [] }, { background: [] }],
                      ["bold", "italic", "underline", "strike", "blockquote"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["link", "image"],
                    ],
                  }}
                />
              </div>
              {formik.touched.content && formik.errors.content && (
                <p className="text-sm text-red-500">{formik.errors.content}</p>
              )}
            </div>

            <div className="space-y-2">
              <LabelWithTooltip
                htmlFor="excerpt"
                label="Ringkasan (Otomatis)"
                tooltip="Ringkasan singkat artikel yang dibuat otomatis dari konten. Digunakan di halaman daftar artikel."
              />
              <Textarea
                id="excerpt"
                disabled
                {...formik.getFieldProps("excerpt")}
                readOnly
                className="bg-gray-50"
              />
              {formik.touched.excerpt && formik.errors.excerpt && (
                <p className="text-sm text-red-500">{formik.errors.excerpt}</p>
              )}
            </div>

            <div className="space-y-2">
              <LabelWithTooltip
                htmlFor="status"
                label="Status"
                tooltip="Draft untuk menyimpan artikel tanpa dipublikasikan. Terbit untuk menampilkan artikel ke publik."
              />
              <Select
                value={formik.values.status}
                onValueChange={(value) => formik.setFieldValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Terbit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gambar Utama</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FeaturedImageArticle
              value={formik.values.featured_image}
              onChange={(imageData) =>
                formik.setFieldValue("featured_image", imageData)
              }
            />
            {formik.touched.featured_image?.url &&
              formik.errors.featured_image?.url && (
                <p className="text-sm text-red-500">
                  {formik.errors.featured_image.url}
                </p>
              )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO & Meta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="meta.title"
                  label="Judul Meta"
                  tooltip="Judul yang muncul di hasil pencarian Google. Idealnya tidak lebih dari 60 karakter."
                />
                <Input
                  id="meta.title"
                  {...formik.getFieldProps("meta.title")}
                />
                <CharacterCountSEO
                  current={formik.values.meta.title.length}
                  type="title"
                />
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="meta.description"
                  label="Deskripsi Meta"
                  tooltip="Deskripsi singkat yang muncul di hasil pencarian Google. Idealnya tidak lebih dari 160 karakter."
                />
                <Textarea
                  id="meta.description"
                  {...formik.getFieldProps("meta.description")}
                />
                <CharacterCountSEO
                  current={formik.values.meta.description.length}
                  type="description"
                />
              </div>

              {/* Hidden OG Image field */}
              <Input
                type="hidden"
                id="meta.og_image"
                {...formik.getFieldProps("meta.og_image")}
              />
            </div>

            <div className="border rounded-lg p-4 bg-white space-y-2">
              <h4 className="text-sm font-medium text-gray-500">
                Pratinjau Hasil Pencarian Google
              </h4>
              <GoogleSearchPreview
                title={formik.values.meta.title || formik.values.title}
                description={formik.values.meta.description}
                slug={formik.values.slug}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? "Menyimpan..." : "Simpan Artikel"}
          </Button>
        </div>
      </form>
    </div>
  );
}
