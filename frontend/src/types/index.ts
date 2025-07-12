export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export interface CppAnalysisResult {
  wordCount: number;
  keywordCount: number;
  sentimentScore: number;
  keywords: string[];
  readingTime: number;
}

export interface MlAnalysisResult {
  sentiment_score: number;
  sentiment_label: string;
  subjectivity_score: number;
  text_category: string;
  category_confidence: number;
  key_phrases: string[];
  word_count: number;
  reading_time_minutes: number;
  complexity_score: number;
}

export interface EnhancedAnalysisResult {
  cppAnalysis: CppAnalysisResult;
  mlAnalysis: MlAnalysisResult;
  combinedSentiment: {
    score: number;
    label: string;
    confidence: number;
  };
  textInsights: {
    category: string;
    complexity: string;
    readability: string;
    keyTopics: string[];
  };
  processingTime: {
    cpp: number;
    ml: number;
    total: number;
  };
  analysisQuality: {
    cppAvailable: boolean;
    mlAvailable: boolean;
    fallbackUsed: boolean;
  };
}

// Keep the old interface for backward compatibility
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