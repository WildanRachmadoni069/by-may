// SERVER-SIDE ONLY - do not import in client components
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client"; // Import Prisma namespace
import type {
  FAQ,
  FAQFormValues,
  GetFAQsOptions,
  FilteredFAQsResponse,
} from "@/types/faq";

// Get all FAQs
export async function getFAQs(): Promise<FAQ[]> {
  const faqs = await db.fAQ.findMany({
    orderBy: { order: "asc" },
  });

  return faqs.map(formatFaqResponse);
}

// Get filtered FAQs
export async function getFilteredFAQs(
  options: GetFAQsOptions
): Promise<FilteredFAQsResponse> {
  const { searchQuery, itemsPerPage = 10, page = 1 } = options;

  // Use proper Prisma.QueryMode enum instead of string
  const where = searchQuery
    ? {
        OR: [
          {
            question: {
              contains: searchQuery,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            answer: {
              contains: searchQuery,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }
    : {};

  const skip = (page - 1) * itemsPerPage;

  const faqs = await db.fAQ.findMany({
    where,
    orderBy: { order: "asc" },
    take: itemsPerPage,
    skip,
  });

  const total = await db.fAQ.count({ where });

  return {
    faqs: faqs.map(formatFaqResponse),
    pagination: {
      page,
      total,
      hasMore: skip + faqs.length < total,
    },
  };
}

// Get single FAQ by ID
export async function getFAQ(id: string): Promise<FAQ | null> {
  const faq = await db.fAQ.findUnique({
    where: { id },
  });

  if (!faq) return null;

  return formatFaqResponse(faq);
}

// Create new FAQ
export async function createFAQ(faqData: FAQFormValues): Promise<FAQ> {
  // Get max order to place new FAQ at the end
  const maxOrderFaq = await db.fAQ.findFirst({
    orderBy: { order: "desc" },
  });

  const nextOrder = maxOrderFaq ? maxOrderFaq.order + 1 : 0;

  const faq = await db.fAQ.create({
    data: {
      ...faqData,
      order: nextOrder,
    },
  });

  return formatFaqResponse(faq);
}

// Update FAQ
export async function updateFAQ(
  id: string,
  faqData: Partial<FAQFormValues>
): Promise<FAQ> {
  const faq = await db.fAQ.update({
    where: { id },
    data: faqData,
  });

  return formatFaqResponse(faq);
}

// Delete FAQ
export async function deleteFAQ(id: string): Promise<void> {
  await db.fAQ.delete({
    where: { id },
  });
}

// Reorder FAQs
export async function reorderFAQs(
  reorderedFAQs: { id: string; order: number }[]
): Promise<void> {
  // Create a transaction to update all FAQs at once
  await db.$transaction(
    reorderedFAQs.map(({ id, order }) =>
      db.fAQ.update({
        where: { id },
        data: { order },
      })
    )
  );
}

// Helper function to format FAQ response
function formatFaqResponse(dbFaq: any): FAQ {
  return {
    id: dbFaq.id,
    question: dbFaq.question,
    answer: dbFaq.answer,
    order: dbFaq.order || 0,
    createdAt: dbFaq.createdAt,
    updatedAt: dbFaq.updatedAt,
  };
}
