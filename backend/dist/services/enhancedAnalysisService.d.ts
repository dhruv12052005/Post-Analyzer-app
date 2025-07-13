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
export interface AnalysisLog {
    id?: number;
    postId?: number;
    analysisType: string;
    result: EnhancedAnalysisResult;
    processingTimeMs?: number;
    createdAt?: Date;
}
export declare class EnhancedAnalysisService {
    private cppServiceUrl;
    private mlServiceUrl;
    constructor();
    analyzeText(text: string, postId?: number): Promise<EnhancedAnalysisResult>;
    private performCppAnalysis;
    private performMlAnalysis;
    private performCppFallbackAnalysis;
    private performMlFallbackAnalysis;
    private combineAnalyses;
    logAnalysis(log: AnalysisLog): Promise<void>;
    getAnalysisHistory(postId: number): Promise<AnalysisLog[]>;
}
//# sourceMappingURL=enhancedAnalysisService.d.ts.map