export interface AnalysisResult {
    wordCount: number;
    keywordCount: number;
    sentimentScore: number;
    keywords: string[];
    readingTime: number;
}
export interface AnalysisLog {
    id?: number;
    postId?: number;
    analysisType: string;
    result: AnalysisResult;
    processingTimeMs?: number;
    createdAt?: Date;
}
export declare class AnalysisService {
    private cppServiceUrl;
    constructor();
    analyzeText(text: string, postId?: number): Promise<AnalysisResult>;
    private performFallbackAnalysis;
    logAnalysis(log: AnalysisLog): Promise<void>;
    getAnalysisHistory(postId: number): Promise<AnalysisLog[]>;
    getAnalysisStats(): Promise<{
        totalAnalyses: number;
        cppAnalyses: number;
        fallbackAnalyses: number;
        averageProcessingTime: number;
    }>;
}
//# sourceMappingURL=analysisService.d.ts.map