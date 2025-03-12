export interface FAQ {
  id: string;
  question: string;
  answer: string;
  createdAt?: Date;
  updatedAt?: Date;
  order?: number;
}

export interface FAQFormValues {
  question: string;
  answer: string;
}

export interface GetFAQsOptions {
  searchQuery?: string;
  itemsPerPage?: number;
  lastDoc?: any;
}

export interface FilteredFAQsResponse {
  faqs: FAQ[];
  lastDoc: any | null;
  hasMore: boolean;
}
