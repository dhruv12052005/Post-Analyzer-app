export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export interface PostAnalysis {
  wordCount: number;
  keywordCount: number;
  sentimentScore: number;
  keywords: string[];
  readingTime: number;
}

export interface CreatePostRequest {
  title: string;
  body: string;
  userId: number;
}

export interface UpdatePostRequest {
  title?: string;
  body?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 