import { getDatabase } from '../utils/database';
import axios from 'axios';

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

export class AnalysisService {
  private cppServiceUrl: string;

  constructor() {
    this.cppServiceUrl = process.env.CPP_SERVICE_URL || 'http://localhost:8000';
  }

  async analyzeText(text: string, postId?: number): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    try {
      // Try C++ service first
      const analysisResponse = await axios.post(`${this.cppServiceUrl}/analyze`, {
        text: text
      }, {
        timeout: 5000 // 5 second timeout
      });

      const analysis = analysisResponse.data;
      const processingTime = Date.now() - startTime;

      // Log the analysis result
      if (postId) {
        await this.logAnalysis({
          postId,
          analysisType: 'cpp_sentiment',
          result: analysis,
          processingTimeMs: processingTime
        });
      }

      return analysis;
    } catch (error: any) {
      console.error('C++ analysis service error:', error.message);
      
      // Fallback to JavaScript analysis
      const fallbackAnalysis = this.performFallbackAnalysis(text);
      const processingTime = Date.now() - startTime;

      // Log the fallback analysis
      if (postId) {
        await this.logAnalysis({
          postId,
          analysisType: 'js_fallback',
          result: fallbackAnalysis,
          processingTimeMs: processingTime
        });
      }

      return fallbackAnalysis;
    }
  }

  private performFallbackAnalysis(text: string): AnalysisResult {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const keywords = words
      .filter(word => word.length > 5)
      .slice(0, 5);

    // Simple sentiment calculation based on positive/negative words
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'like', 'enjoy', 'happy', 'beautiful', 'perfect', 'fantastic', 'brilliant', 'outstanding'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'horrible', 'worst', 'disappointing', 'frustrated', 'angry', 'sad', 'upset', 'annoying', 'boring'];

    let sentimentScore = 0;
    const lowerText = text.toLowerCase();
    
    positiveWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = lowerText.match(regex);
      if (matches) {
        sentimentScore += matches.length * 0.1;
      }
    });

    negativeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = lowerText.match(regex);
      if (matches) {
        sentimentScore -= matches.length * 0.1;
      }
    });

    // Normalize sentiment score to [-1, 1] range
    sentimentScore = Math.max(-1, Math.min(1, sentimentScore));

    return {
      wordCount: words.length,
      keywordCount: keywords.length,
      sentimentScore: sentimentScore,
      keywords: keywords,
      readingTime: Math.ceil(words.length / 200) // 200 words per minute
    };
  }

  async logAnalysis(log: AnalysisLog): Promise<void> {
    try {
      const database = await getDatabase();
      await database.run(`
        INSERT INTO analysis_logs (post_id, analysis_type, result, processing_time_ms, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `, [
        log.postId,
        log.analysisType,
        JSON.stringify(log.result),
        log.processingTimeMs
      ]);
    } catch (error) {
      console.error('Error logging analysis:', error);
      // Don't throw error as this is not critical for the main functionality
    }
  }

  async getAnalysisHistory(postId: number): Promise<AnalysisLog[]> {
    try {
      const database = await getDatabase();
      const rows = await database.all(`
        SELECT id, post_id as postId, analysis_type as analysisType, 
               result, processing_time_ms as processingTimeMs, created_at as createdAt
        FROM analysis_logs 
        WHERE post_id = ?
        ORDER BY created_at DESC
      `, [postId]);
      
      return rows.map(row => ({
        ...row,
        result: JSON.parse(row.result)
      }));
    } catch (error) {
      console.error('Error fetching analysis history:', error);
      throw error;
    }
  }

  async getAnalysisStats(): Promise<{
    totalAnalyses: number;
    cppAnalyses: number;
    fallbackAnalyses: number;
    averageProcessingTime: number;
  }> {
    try {
      const database = await getDatabase();
      const rows = await database.all(`
        SELECT 
          COUNT(*) as totalAnalyses,
          SUM(CASE WHEN analysis_type = 'cpp_sentiment' THEN 1 ELSE 0 END) as cppAnalyses,
          SUM(CASE WHEN analysis_type = 'js_fallback' THEN 1 ELSE 0 END) as fallbackAnalyses,
          AVG(processing_time_ms) as averageProcessingTime
        FROM analysis_logs
      `);
      
      const stats = rows[0];
      
      return {
        totalAnalyses: stats.totalAnalyses || 0,
        cppAnalyses: stats.cppAnalyses || 0,
        fallbackAnalyses: stats.fallbackAnalyses || 0,
        averageProcessingTime: Math.round(stats.averageProcessingTime || 0)
      };
    } catch (error) {
      console.error('Error fetching analysis stats:', error);
      throw error;
    }
  }
} 