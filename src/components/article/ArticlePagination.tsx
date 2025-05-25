/**
 * Komponen Paginasi Artikel
 * @module ArticlePagination
 * @description Menampilkan navigasi halaman untuk daftar artikel dengan fitur:
 * - Tombol Sebelumnya/Selanjutnya
 * - Indikator halaman aktif
 * - Elipsis untuk rentang halaman panjang
 * - Mendukung parameter pencarian
 * Menggunakan Client Component untuk interaksi dinamis.
 */
"use client";

import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

/**
 * Props untuk komponen ArticlePagination
 */
interface ArticlePaginationProps {
  /** Halaman yang sedang aktif */
  currentPage: number;
  /** Total jumlah halaman */
  totalPages: number;
  /** Query pencarian aktif (opsional) */
  search?: string;
}

export function ArticlePagination({
  currentPage,
  totalPages,
  search = "",
}: ArticlePaginationProps) {
  // Create URL with current search and page parameters
  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (pageNumber > 1) params.set("page", pageNumber.toString());

    const queryString = params.toString();
    return `/artikel${queryString ? `?${queryString}` : ""}`;
  };

  // Generate array of page numbers to show
  const generatePaginationItems = () => {
    const items = [];

    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink href={createPageURL(1)} isActive={currentPage === 1}>
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Add ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show current page and neighbors
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (i <= 1 || i >= totalPages) continue; // Skip first and last page as they're always shown

      items.push(
        <PaginationItem key={i}>
          <PaginationLink href={createPageURL(i)} isActive={currentPage === i}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Add ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink
            href={createPageURL(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={currentPage > 1 ? createPageURL(currentPage - 1) : "#"}
            aria-disabled={currentPage === 1}
            className={
              currentPage === 1 ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>

        {generatePaginationItems()}

        <PaginationItem>
          <PaginationNext
            href={
              currentPage < totalPages ? createPageURL(currentPage + 1) : "#"
            }
            aria-disabled={currentPage === totalPages}
            className={
              currentPage === totalPages ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
