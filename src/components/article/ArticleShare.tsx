/**
 * Komponen Bagian Berbagi Artikel
 * @module ArticleShare
 * @description Menyediakan tombol untuk berbagi artikel ke media sosial dan menyalin link.
 * Termasuk fitur berbagi ke Facebook, Twitter, dan menyalin URL artikel.
 * Menggunakan Client Component untuk interaksi dengan Web Share API dan clipboard.
 */
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Facebook, Twitter, Link as LinkIcon, Share } from "lucide-react";
import { getBaseUrl } from "@/lib/utils/url";
import { toast } from "@/hooks/use-toast";

/**
 * Props untuk komponen ArticleShare
 */
interface ArticleShareProps {
  /** Judul artikel untuk dibagikan */
  title: string;
  /** Slug artikel untuk membuat URL */
  slug: string;
}

/**
 * Komponen untuk berbagi artikel ke media sosial
 * @param props - Props komponen
 * @returns Komponen berbagi artikel dengan tombol media sosial
 */
export function ArticleShare({ title, slug }: ArticleShareProps) {
  const url = `${getBaseUrl()}/artikel/${slug}`;
  /**
   * Membuka dialog berbagi ke Facebook
   */
  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank"
    );
  };
  /**
   * Membuka dialog berbagi ke Twitter
   */
  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        title
      )}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };
  /**
   * Menyalin URL artikel ke clipboard dan menampilkan notifikasi
   */
  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        description: "Link artikel berhasil disalin!",
      });
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={shareOnFacebook}
        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
      >
        <Facebook className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={shareOnTwitter}
        className="text-sky-500 hover:text-sky-700 hover:bg-sky-50"
      >
        <Twitter className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={copyLink}
        className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          >
            <Share className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={shareOnFacebook}>
            <Facebook className="h-4 w-4 mr-2" /> Facebook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={shareOnTwitter}>
            <Twitter className="h-4 w-4 mr-2" /> Twitter
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyLink}>
            <LinkIcon className="h-4 w-4 mr-2" /> Salin Link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
