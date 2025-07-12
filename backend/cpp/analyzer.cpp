#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <algorithm>
#include <sstream>
#include <cctype>
#include <regex>
#include <cmath>

class PostAnalyzer {
private:
    std::vector<std::string> stopWords = {
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
        "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
        "will", "would", "could", "should", "may", "might", "can", "this", "that", "these", "those",
        "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them"
    };

    std::map<std::string, double> positiveWords = {
        {"good", 1.0}, {"great", 1.5}, {"excellent", 2.0}, {"amazing", 2.0}, {"wonderful", 1.8},
        {"love", 1.5}, {"like", 1.0}, {"enjoy", 1.2}, {"happy", 1.3}, {"beautiful", 1.4},
        {"perfect", 2.0}, {"fantastic", 1.8}, {"brilliant", 1.7}, {"outstanding", 1.6}
    };

    std::map<std::string, double> negativeWords = {
        {"bad", -1.0}, {"terrible", -2.0}, {"awful", -2.0}, {"hate", -1.5}, {"dislike", -1.0},
        {"horrible", -2.0}, {"worst", -2.0}, {"disappointing", -1.5}, {"frustrated", -1.2},
        {"angry", -1.3}, {"sad", -1.1}, {"upset", -1.2}, {"annoying", -1.1}, {"boring", -1.0}
    };

public:
    struct AnalysisResult {
        int wordCount;
        int keywordCount;
        double sentimentScore;
        std::vector<std::string> keywords;
        int readingTime;
    };

    std::string toLower(const std::string& str) {
        std::string result = str;
        std::transform(result.begin(), result.end(), result.begin(), ::tolower);
        return result;
    }

    std::vector<std::string> tokenize(const std::string& text) {
        std::vector<std::string> tokens;
        std::stringstream ss(text);
        std::string token;
        
        while (ss >> token) {
            // Remove punctuation
            token.erase(std::remove_if(token.begin(), token.end(), ::ispunct), token.end());
            if (!token.empty()) {
                tokens.push_back(toLower(token));
            }
        }
        return tokens;
    }

    bool isStopWord(const std::string& word) {
        return std::find(stopWords.begin(), stopWords.end(), word) != stopWords.end();
    }

    std::vector<std::string> extractKeywords(const std::vector<std::string>& tokens) {
        std::map<std::string, int> wordFreq;
        
        for (const auto& token : tokens) {
            if (!isStopWord(token) && token.length() > 3) {
                wordFreq[token]++;
            }
        }

        // Convert to vector and sort by frequency
        std::vector<std::pair<std::string, int>> sortedWords(wordFreq.begin(), wordFreq.end());
        std::sort(sortedWords.begin(), sortedWords.end(), 
                  [](const auto& a, const auto& b) { return a.second > b.second; });

        std::vector<std::string> keywords;
        for (int i = 0; i < std::min(5, (int)sortedWords.size()); ++i) {
            keywords.push_back(sortedWords[i].first);
        }
        
        return keywords;
    }

    double calculateSentiment(const std::vector<std::string>& tokens) {
        double totalScore = 0.0;
        int wordCount = 0;

        for (const auto& token : tokens) {
            double score = 0.0;
            
            // Check positive words
            auto posIt = positiveWords.find(token);
            if (posIt != positiveWords.end()) {
                score += posIt->second;
            }
            
            // Check negative words
            auto negIt = negativeWords.find(token);
            if (negIt != negativeWords.end()) {
                score += negIt->second;
            }
            
            if (score != 0.0) {
                totalScore += score;
                wordCount++;
            }
        }

        return wordCount > 0 ? totalScore / wordCount : 0.0;
    }

    AnalysisResult analyze(const std::string& text) {
        std::vector<std::string> tokens = tokenize(text);
        
        AnalysisResult result;
        result.wordCount = tokens.size();
        result.keywords = extractKeywords(tokens);
        result.keywordCount = result.keywords.size();
        result.sentimentScore = calculateSentiment(tokens);
        result.readingTime = std::max(1, (int)std::ceil(tokens.size() / 200.0)); // 200 words per minute
        
        return result;
    }
};

// Export functions for WebAssembly
extern "C" {
    PostAnalyzer* createAnalyzer() {
        return new PostAnalyzer();
    }

    void destroyAnalyzer(PostAnalyzer* analyzer) {
        delete analyzer;
    }

    int analyzeText(PostAnalyzer* analyzer, const char* text, 
                   int* wordCount, int* keywordCount, double* sentimentScore, 
                   int* readingTime, char** keywords, int maxKeywords) {
        try {
            std::string textStr(text);
            PostAnalyzer::AnalysisResult result = analyzer->analyze(textStr);
            
            *wordCount = result.wordCount;
            *keywordCount = result.keywordCount;
            *sentimentScore = result.sentimentScore;
            *readingTime = result.readingTime;
            
            // Copy keywords (simplified - in real implementation, you'd need proper memory management)
            for (int i = 0; i < std::min(maxKeywords, (int)result.keywords.size()); ++i) {
                keywords[i] = const_cast<char*>(result.keywords[i].c_str());
            }
            
            return 0; // Success
        } catch (...) {
            return -1; // Error
        }
    }
} 