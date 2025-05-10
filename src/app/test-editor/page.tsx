"use client";

import React, { useState, useRef } from "react";
import MyEditorArticle from "@/components/editor/MyEditorArticle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Quill from "quill";

function TestEditorPage() {
  const [content, setContent] = useState(
    "<p>Ini adalah contoh konten artikel...</p>"
  );
  const [title, setTitle] = useState("Contoh Judul Artikel");
  const quillRef = useRef<Quill | null>(null);

  const handleSave = () => {
    console.log("Judul:", title);
    console.log("Konten:", content);
    alert("Artikel disimpan! Cek konsol untuk melihat data.");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Uji Coba Editor Artikel</h1>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Buat Artikel Baru</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="title">Judul Artikel</Label>
            <Input
              id="title"
              value={title}
              onChange={handleTitleChange}
              placeholder="Masukkan judul artikel..."
            />
          </div>
          <div className="grid w-full gap-1.5">
            <Label htmlFor="content">Konten Artikel</Label>
            <div className="h-[350px] sm:h-[400px] md:h-[450px] relative">
              <MyEditorArticle
                ref={quillRef}
                value={content}
                onChange={setContent}
                placeholder="Tulis konten artikel di sini..."
                minHeight="150px"
                maxHeight="none"
                size="default"
                variant="default"
                fullWidth={true}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline">Batal</Button>
          <Button onClick={handleSave}>Simpan Artikel</Button>
        </CardFooter>
      </Card>

      <Card className="w-full mt-8">
        <CardHeader>
          <CardTitle>Preview Artikel</CardTitle>
        </CardHeader>

        <CardContent>
          <h2 className="text-2xl font-semibold mb-4">{title}</h2>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default TestEditorPage;
