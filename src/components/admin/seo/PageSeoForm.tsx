"use client";

import * as React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import LabelWithTooltip from "@/components/general/LabelWithTooltip";
import CharacterCountSEO from "@/components/seo/CharacterCountSEO";
import GoogleSearchPreview from "@/components/general/GoogleSearchPreview";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseConfig";

export interface PageSeoFormValues {
  title: string;
  description: string;
  keywords: string;
  og_image: string;
}

interface PageSeoFormProps {
  initialValues: PageSeoFormValues;
  pageId: string;
  pageSlug: string;
  pageType: string;
  onSuccess?: () => void;
}

export function PageSeoForm({
  initialValues,
  pageId,
  pageSlug,
  pageType,
  onSuccess,
}: PageSeoFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      description: Yup.string().required("Description is required"),
      keywords: Yup.string(),
      og_image: Yup.string().url("Must be a valid URL").nullable(),
    }),
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);

        // Update SEO data in Firestore
        const seoRef = doc(db, "seo_settings", pageId);
        await updateDoc(seoRef, {
          title: values.title,
          description: values.description,
          keywords: values.keywords,
          og_image: values.og_image || "",
          updatedAt: new Date(),
        });

        toast({
          title: "SEO settings updated",
          description: `The SEO settings for the ${pageType} page have been successfully updated.`,
        });

        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error("Error updating SEO settings:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update SEO settings. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <LabelWithTooltip
            htmlFor="title"
            label="Meta Title"
            tooltip="The title that appears in search engine results. Ideally 50-60 characters."
          />
          <Input
            id="title"
            placeholder="Enter meta title"
            {...formik.getFieldProps("title")}
          />
          {formik.touched.title && formik.errors.title ? (
            <div className="text-red-500 text-sm">{formik.errors.title}</div>
          ) : null}
          <CharacterCountSEO
            current={formik.values.title.length}
            type="title"
          />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip
            htmlFor="description"
            label="Meta Description"
            tooltip="A brief summary that appears in search engine results. Ideally 150-160 characters."
          />
          <Textarea
            id="description"
            placeholder="Enter meta description"
            {...formik.getFieldProps("description")}
          />
          {formik.touched.description && formik.errors.description ? (
            <div className="text-red-500 text-sm">
              {formik.errors.description}
            </div>
          ) : null}
          <CharacterCountSEO
            current={formik.values.description.length}
            type="description"
          />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip
            htmlFor="keywords"
            label="Keywords"
            tooltip="Comma-separated keywords related to your page. Less important for modern SEO but still useful for content organization."
          />
          <Textarea
            id="keywords"
            placeholder="e.g., al-quran custom, sajadah, tasbih, hampers islami"
            {...formik.getFieldProps("keywords")}
          />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip
            htmlFor="og_image"
            label="OG Image URL"
            tooltip="The image that appears when your page is shared on social media. Recommended size: 1200 x 630 pixels."
          />
          <Input
            id="og_image"
            placeholder="https://example.com/image.jpg"
            {...formik.getFieldProps("og_image")}
          />
          {formik.touched.og_image && formik.errors.og_image ? (
            <div className="text-red-500 text-sm">{formik.errors.og_image}</div>
          ) : null}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="border rounded-lg p-4 bg-white space-y-2">
            <h4 className="text-sm font-medium text-gray-500">
              Google Search Preview
            </h4>
            <GoogleSearchPreview
              title={formik.values.title}
              description={formik.values.description}
              slug={pageSlug}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save SEO Settings"}
        </Button>
      </div>
    </form>
  );
}
