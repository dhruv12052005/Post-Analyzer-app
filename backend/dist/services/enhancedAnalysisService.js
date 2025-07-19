"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedAnalysisService = void 0;
const database_1 = require("../utils/database");
const axios_1 = __importDefault(require("axios"));
class EnhancedAnalysisService {
    constructor() {
        this.cppServiceUrl = process.env.CPP_SERVICE_URL || 'http://localhost:8000';
        this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8001';
    }
    async analyzeText(text, postId) {
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
        const enhancedResult = this.combineAnalyses(cppResult, mlResult, cppTime, mlTime, totalTime, cppAvailable, mlAvailable, text);
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
    async performCppAnalysis(text) {
        const startTime = Date.now();
        try {
            console.log(`[C++ Service] 🔍 Attempting to call C++ service at: ${this.cppServiceUrl}/analyze`);
            console.log(`[C++ Service] 📝 Request payload:`, { text: text.substring(0, 100) + (text.length > 100 ? '...' : '') });
            const requestPayload = { text: text };
            console.log(`[C++ Service] 📤 Sending request:`, JSON.stringify(requestPayload));
            const response = await axios_1.default.post(`${this.cppServiceUrl}/analyze`, requestPayload, {
                timeout: 10000, // Increased timeout for better reliability
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'PostAnalyzer-Backend/1.0'
                }
            });
            const responseTime = Date.now() - startTime;
            console.log(`[C++ Service] ✅ Success - Response received in ${responseTime}ms`);
            console.log(`[C++ Service] 📊 Response data:`, response.data);
            // Validate response structure
            const requiredFields = ['wordCount', 'keywordCount', 'sentimentScore', 'readingTime', 'keywords'];
            const missingFields = requiredFields.filter(field => !(field in response.data));
            if (missingFields.length > 0) {
                console.error(`[C++ Service] ⚠️ Invalid response structure - missing fields:`, missingFields);
                console.error(`[C++ Service] 📄 Actual response:`, response.data);
                throw new Error(`Invalid C++ service response - missing fields: ${missingFields.join(', ')}`);
            }
            // Check for suspicious values that might indicate fallback
            const sentimentScore = response.data.sentimentScore;
            const wordCount = response.data.wordCount;
            if (typeof sentimentScore !== 'number' || isNaN(sentimentScore)) {
                console.error(`[C++ Service] ⚠️ Invalid sentiment score:`, sentimentScore);
                throw new Error('Invalid sentiment score from C++ service');
            }
            if (typeof wordCount !== 'number' || wordCount < 0) {
                console.error(`[C++ Service] ⚠️ Invalid word count:`, wordCount);
                throw new Error('Invalid word count from C++ service');
            }
            // Log detailed analysis results
            console.log(`[C++ Service] 📈 Analysis results:`, {
                wordCount: response.data.wordCount,
                keywordCount: response.data.keywordCount,
                sentimentScore: response.data.sentimentScore,
                readingTime: response.data.readingTime,
                keywords: response.data.keywords,
                responseTime: responseTime
            });
            return {
                result: response.data,
                time: responseTime,
                available: true
            };
        }
        catch (error) {
            const errorTime = Date.now() - startTime;
            const errorDetails = {
                url: `${this.cppServiceUrl}/analyze`,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: error?.code,
                status: error?.response?.status,
                statusText: error?.response?.statusText,
                responseData: error?.response?.data,
                timeout: errorTime,
                cppServiceUrl: this.cppServiceUrl,
                requestText: text.substring(0, 200) + (text.length > 200 ? '...' : '')
            };
            console.error(`[C++ Service] ❌ Failed after ${errorTime}ms - Error details:`, errorDetails);
            // Additional diagnostics
            if (error?.code === 'ECONNREFUSED') {
                console.error(`[C++ Service] 🔍 Connection refused - C++ service may not be running on ${this.cppServiceUrl}`);
            }
            else if (error?.code === 'ETIMEDOUT') {
                console.error(`[C++ Service] ⏰ Request timed out after ${errorTime}ms`);
            }
            else if (error?.response?.status) {
                console.error(`[C++ Service] 📡 HTTP ${error?.response?.status}: ${error?.response?.statusText}`);
                console.error(`[C++ Service] 📄 Response body:`, error?.response?.data);
            }
            else if (error instanceof Error) {
                console.error(`[C++ Service] 🚨 Service error:`, error.message);
            }
            // Return fallback analysis with availability flag
            const fallbackResult = this.performCppFallbackAnalysis(text);
            console.log(`[C++ Service] 🔄 Using fallback analysis:`, fallbackResult);
            return {
                result: fallbackResult,
                time: errorTime,
                available: false
            };
        }
    }
    async performMlAnalysis(text) {
        const startTime = Date.now();
        try {
            console.log(`[ML Service] Attempting to call ML service at: ${this.mlServiceUrl}/analyze`);
            const response = await axios_1.default.post(`${this.mlServiceUrl}/analyze`, {
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
        }
        catch (error) {
            console.error(`[ML Service] ❌ Failed - Error details:`, {
                url: `${this.mlServiceUrl}/analyze`,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: error?.code,
                status: error?.response?.status,
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
    performCppFallbackAnalysis(text) {
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
    performMlFallbackAnalysis(text) {
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
    combineAnalyses(cppResult, mlResult, cppTime, mlTime, totalTime, cppAvailable, mlAvailable, text = '') {
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
    async logAnalysis(log) {
        try {
            const database = await (0, database_1.getDatabase)();
            await database.run(`
        INSERT INTO analysis_logs (post_id, analysis_type, result, processing_time_ms, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `, [
                log.postId,
                log.analysisType,
                JSON.stringify(log.result),
                log.processingTimeMs
            ]);
        }
        catch (error) {
            console.error('Error logging analysis:', error);
        }
    }
    async getAnalysisHistory(postId) {
        try {
            const database = await (0, database_1.getDatabase)();
            const rows = await database.all(`
        SELECT id, post_id as postId, analysis_type as analysisType, 
               result, processing_time_ms as processingTimeMs, created_at as createdAt
        FROM analysis_logs 
        WHERE post_id = ?
        ORDER BY created_at DESC
      `, [postId]);
            return rows.map((row) => ({
                ...row,
                result: JSON.parse(row.result)
            }));
        }
        catch (error) {
            console.error('Error fetching analysis history:', error);
            throw error;
        }
    }
}
exports.EnhancedAnalysisService = EnhancedAnalysisService;
//# sourceMappingURL=enhancedAnalysisService.js.map