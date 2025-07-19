import { getDatabase } from '../utils/database';
import axios from 'axios';

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
  // C++ Analysis
  cppAnalysis: CppAnalysisResult;
  // ML Analysis
  mlAnalysis: MlAnalysisResult;
  // Combined insights
  combinedSentiment: {
    score: number;
    label: string;
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

export class EnhancedAnalysisService {
  private cppServiceUrl: string;
  private mlServiceUrl: string;

  constructor() {
    this.cppServiceUrl = process.env.CPP_SERVICE_URL || 'http://localhost:8000';
    this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8001';
  }

  async analyzeText(text: string, postId?: number): Promise<EnhancedAnalysisResult> {
    const startTime = Date.now();
    
    // Run both analyses in parallel
    const [cppAnalysis, mlAnalysis] = await Promise.allSettled([
      this.performCppAnalysis(text),
      this.performMlAnalysis(text)
    ]);

    const totalTime = Date.now() - startTime;
    
    // Extract results, timing, and availability
    const cppResult = cppAnalysis.status === 'fulfilled' ? cppAnalysis.value.result : null;
    const cppTime = cppAnalysis.status === 'fulfilled' ? cppAnalysis.value.time : 0;
    const cppAvailable = cppAnalysis.status === 'fulfilled' ? cppAnalysis.value.available : false;
    
    const mlResult = mlAnalysis.status === 'fulfilled' ? mlAnalysis.value.result : null;
    const mlTime = mlAnalysis.status === 'fulfilled' ? mlAnalysis.value.time : 0;
    const mlAvailable = mlAnalysis.status === 'fulfilled' ? mlAnalysis.value.available : false;

    // Create enhanced result
    const enhancedResult = this.combineAnalyses(
      cppResult,
      mlResult,
      cppTime,
      mlTime,
      totalTime,
      cppAvailable,
      mlAvailable,
      text
    );

    // Log the analysis
    if (postId) {
      await this.logAnalysis({
        postId,
        analysisType: 'enhanced_analysis',
        result: enhancedResult,
        processingTimeMs: totalTime
      });
    }

    return enhancedResult;
  }

  private async performCppAnalysis(text: string): Promise<{ result: CppAnalysisResult | null; time: number; available: boolean }> {
    const startTime = Date.now();
    
    try {
      console.log(`[C++ Service] 🔍 Attempting to call C++ service at: ${this.cppServiceUrl}/analyze`);
      console.log(`[C++ Service] 📝 Request payload:`, { text: text.substring(0, 100) + (text.length > 100 ? '...' : '') });
      
      const response = await axios.post(`${this.cppServiceUrl}/analyze`, {
        text: text
      }, {
        timeout: 10000, // Increased timeout for better reliability
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PostAnalyzer-Backend/1.0'
        }
      });

      const responseTime = Date.now() - startTime;
      console.log(`[C++ Service] ✅ Success - Response received in ${responseTime}ms`);
      console.log(`[C++ Service] 📊 Response data:`, {
        wordCount: response.data.wordCount,
        keywordCount: response.data.keywordCount,
        sentimentScore: response.data.sentimentScore,
        readingTime: response.data.readingTime,
        keywords: response.data.keywords
      });
      
      return {
        result: response.data,
        time: responseTime,
        available: true
      };
    } catch (error) {
      const errorTime = Date.now() - startTime;
      const errorDetails = {
        url: `${this.cppServiceUrl}/analyze`,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        status: (error as any)?.response?.status,
        statusText: (error as any)?.response?.statusText,
        responseData: (error as any)?.response?.data,
        timeout: errorTime,
        cppServiceUrl: this.cppServiceUrl
      };
      
      console.error(`[C++ Service] ❌ Failed after ${errorTime}ms - Error details:`, errorDetails);
      
      // Additional diagnostics
      if ((error as any)?.code === 'ECONNREFUSED') {
        console.error(`[C++ Service] 🔍 Connection refused - C++ service may not be running on ${this.cppServiceUrl}`);
      } else if ((error as any)?.code === 'ETIMEDOUT') {
        console.error(`[C++ Service] ⏰ Request timed out after ${errorTime}ms`);
      } else if ((error as any)?.response?.status) {
        console.error(`[C++ Service] 📡 HTTP ${(error as any)?.response?.status}: ${(error as any)?.response?.statusText}`);
      }
      
      // Return fallback analysis with availability flag
      return {
        result: this.performCppFallbackAnalysis(text),
        time: errorTime,
        available: false
      };
    }
  }

  private async performMlAnalysis(text: string): Promise<{ result: MlAnalysisResult | null; time: number; available: boolean }> {
    const startTime = Date.now();
    
    try {
      console.log(`[ML Service] Attempting to call ML service at: ${this.mlServiceUrl}/analyze`);
      const response = await axios.post(`${this.mlServiceUrl}/analyze`, {
        text: text
      }, {
        timeout: 5000
      });

      console.log(`[ML Service] ✅ Success - Response received in ${Date.now() - startTime}ms:`, response.data);
      return {
        result: response.data,
        time: Date.now() - startTime,
        available: true
      };
    } catch (error) {
      console.error(`[ML Service] ❌ Failed - Error details:`, {
        url: `${this.mlServiceUrl}/analyze`,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        status: (error as any)?.response?.status,
        timeout: Date.now() - startTime
      });
      // Return fallback analysis with availability flag
      return {
        result: this.performMlFallbackAnalysis(text),
        time: Date.now() - startTime,
        available: false
      };
    }
  }

  private performCppFallbackAnalysis(text: string): CppAnalysisResult {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const keywords = words
      .filter(word => word.length > 5)
      .slice(0, 5);

    // Simple sentiment calculation
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'like', 'enjoy', 'happy'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'horrible', 'worst', 'disappointing'];

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

    sentimentScore = Math.max(-1, Math.min(1, sentimentScore));

    return {
      wordCount: words.length,
      keywordCount: keywords.length,
      sentimentScore: sentimentScore,
      keywords: keywords,
      readingTime: Math.ceil(words.length / 200)
    };
  }

  private performMlFallbackAnalysis(text: string): MlAnalysisResult {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    
    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'like', 'enjoy', 'happy'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'horrible', 'worst', 'disappointing'];
    
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

    sentimentScore = Math.max(-1, Math.min(1, sentimentScore));

    // Simple category detection
    const categories = {
      'technical': ['code', 'programming', 'algorithm', 'database', 'api'],
      'personal': ['family', 'friend', 'relationship', 'love', 'life'],
      'business': ['company', 'startup', 'market', 'investment', 'strategy'],
      'news': ['politics', 'election', 'government', 'policy', 'economy']
    };

    let bestCategory = 'general';
    let bestScore = 0;

    Object.entries(categories).forEach(([category, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          score++;
        }
      });
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    });

    return {
      sentiment_score: sentimentScore,
      sentiment_label: sentimentScore > 0.1 ? 'positive' : sentimentScore < -0.1 ? 'negative' : 'neutral',
      subjectivity_score: 0.5, // Default subjectivity
      text_category: bestCategory,
      category_confidence: Math.min(0.9, bestScore / 5),
      key_phrases: words.filter(word => word.length > 4).slice(0, 5),
      word_count: words.length,
      reading_time_minutes: words.length / 200.0
    };
  }

  private combineAnalyses(
    cppResult: CppAnalysisResult | null,
    mlResult: MlAnalysisResult | null,
    cppTime: number,
    mlTime: number,
    totalTime: number,
    cppAvailable: boolean,
    mlAvailable: boolean,
    text: string = ''
  ): EnhancedAnalysisResult {
    // Use fallback if either service is unavailable
    const cppAnalysis = cppResult || this.performCppFallbackAnalysis(text);
    const mlAnalysis = mlResult || this.performMlFallbackAnalysis(text);

    // Enhanced service availability detection
    const cppAvailableOverall = cppAvailable;
    const mlAvailableOverall = mlAvailable;
    const fallbackUsed = !cppAvailableOverall || !mlAvailableOverall;

    // Log service status
    console.log(`[Service Status] C++: ${cppAvailableOverall ? '✅ Available' : '❌ Unavailable'}, ML: ${mlAvailableOverall ? '✅ Available' : '❌ Unavailable'}, Fallback: ${fallbackUsed ? '⚠️ Used' : '✅ Not needed'}`);

    // Use tanh as a probability function to map C++ sentiment score to [-1, 1]
    const probabilityCppScore = Math.tanh(cppAnalysis.sentimentScore);

    // Combine sentiment scores with better weighting
    const cppWeight = 0.4;
    const mlWeight = 0.6; // Give more weight to ML analysis
    const combinedSentimentScore = (probabilityCppScore * cppWeight + mlAnalysis.sentiment_score * mlWeight);
    
    // More sensitive sentiment labeling
    const sentimentLabel = combinedSentimentScore > 0.05 ? 'positive' : 
                          combinedSentimentScore < -0.05 ? 'negative' : 'neutral';

    // Determine readability
    const readability = mlAnalysis.reading_time_minutes < 0.5 ? 'easy' : 
                       mlAnalysis.reading_time_minutes < 2 ? 'moderate' : 'complex';

    // Safely handle key_phrases - ensure it's an array
    const mlKeyPhrases = Array.isArray(mlAnalysis.key_phrases) ? mlAnalysis.key_phrases : [];
    const keyTopics = [...new Set([...cppAnalysis.keywords, ...mlKeyPhrases])].slice(0, 8);

    return {
      cppAnalysis,
      mlAnalysis,
      combinedSentiment: {
        score: combinedSentimentScore,
        label: sentimentLabel
      },
      textInsights: {
        category: mlAnalysis.text_category,
        readability,
        keyTopics
      },
      processingTime: {
        cpp: cppTime,
        ml: mlTime,
        total: totalTime
      },
      analysisQuality: {
        cppAvailable: cppAvailableOverall,
        mlAvailable: mlAvailableOverall,
        fallbackUsed
      }
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
      
      return rows.map((row: any) => ({
        ...row,
        result: JSON.parse(row.result)
      }));
    } catch (error) {
      console.error('Error fetching analysis history:', error);
      throw error;
    }
  }
} 