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
