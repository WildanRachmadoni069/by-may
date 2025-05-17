export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface FAQFormData {
  question: string;
  answer: string;
  order?: number;
}

// Alias FAQFormValues to FAQFormData for backward compatibility
export type FAQFormValues = FAQFormData;

export interface FAQsResponse {
  faqs: FAQ[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FAQFilters {
  page?: number;
  limit?: number;
  searchQuery?: string;
}

// Options for getting filtered FAQs
export interface GetFAQsOptions {
  searchQuery?: string;
  itemsPerPage?: number;
  page?: number;
}

// Response structure for filtered FAQs
export interface FilteredFAQsResponse {
  faqs: FAQ[];
  pagination: {
    page: number;
    total: number;
    hasMore: boolean;
  };
}
