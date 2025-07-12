#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <algorithm>
#include <sstream>
#include <cctype>
#include <cmath>
#include <cstdlib>
#include <cstring>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <thread>
#include <regex>

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
        {"perfect", 2.0}, {"fantastic", 1.8}, {"brilliant", 1.7}, {"outstanding", 1.6},
        {"cool", 1.2}, {"positive", 1.5}, {"awesome", 1.8}, {"superb", 1.7}, {"terrific", 1.6},
        {"delightful", 1.4}, {"pleased", 1.3}, {"satisfied", 1.2}, {"thrilled", 1.6}, {"excited", 1.4}
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
            
            auto posIt = positiveWords.find(token);
            if (posIt != positiveWords.end()) {
                score += posIt->second;
            }
            
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
        result.readingTime = std::max(1, (int)std::ceil(tokens.size() / 200.0));
        
        return result;
    }

    std::string resultToJson(const AnalysisResult& result) {
        std::string json = "{";
        json += "\"wordCount\":" + std::to_string(result.wordCount) + ",";
        json += "\"keywordCount\":" + std::to_string(result.keywordCount) + ",";
        json += "\"sentimentScore\":" + std::to_string(result.sentimentScore) + ",";
        json += "\"readingTime\":" + std::to_string(result.readingTime) + ",";
        json += "\"keywords\":[";
        
        for (size_t i = 0; i < result.keywords.size(); ++i) {
            json += "\"" + result.keywords[i] + "\"";
            if (i < result.keywords.size() - 1) json += ",";
        }
        json += "]}";
        
        return json;
    }
};

class SimpleHTTPServer {
private:
    int serverSocket;
    PostAnalyzer analyzer;
    bool running;

public:
    SimpleHTTPServer() : running(false) {}

    bool start(int port = 8000) {
        serverSocket = socket(AF_INET, SOCK_STREAM, 0);
        if (serverSocket < 0) {
            std::cerr << "Failed to create socket" << std::endl;
            return false;
        }

        int opt = 1;
        setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

        struct sockaddr_in serverAddr;
        serverAddr.sin_family = AF_INET;
        serverAddr.sin_addr.s_addr = INADDR_ANY;
        serverAddr.sin_port = htons(port);

        if (bind(serverSocket, (struct sockaddr*)&serverAddr, sizeof(serverAddr)) < 0) {
            std::cerr << "Failed to bind socket" << std::endl;
            return false;
        }

        if (listen(serverSocket, 5) < 0) {
            std::cerr << "Failed to listen" << std::endl;
            return false;
        }

        running = true;
        std::cout << "C++ Analysis Service running on port " << port << std::endl;
        
        while (running) {
            struct sockaddr_in clientAddr;
            socklen_t clientLen = sizeof(clientAddr);
            int clientSocket = accept(serverSocket, (struct sockaddr*)&clientAddr, &clientLen);
            
            if (clientSocket < 0) {
                std::cerr << "Failed to accept connection" << std::endl;
                continue;
            }

            std::thread([this, clientSocket]() {
                handleClient(clientSocket);
            }).detach();
        }

        return true;
    }

    void stop() {
        running = false;
        close(serverSocket);
    }

private:
    void handleClient(int clientSocket) {
        char buffer[4096];
        int bytesRead = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);
        
        if (bytesRead <= 0) {
            close(clientSocket);
            return;
        }

        buffer[bytesRead] = '\0';
        std::string request(buffer);

        std::string response;
        std::string contentType = "application/json";

        if (request.find("GET /health") != std::string::npos) {
            response = "HTTP/1.1 200 OK\r\n";
            response += "Content-Type: " + contentType + "\r\n";
            response += "Access-Control-Allow-Origin: *\r\n";
            response += "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n";
            response += "Access-Control-Allow-Headers: Content-Type\r\n";
            response += "\r\n";
            response += "{\"status\":\"ok\",\"service\":\"cpp-analyzer\",\"timestamp\":" + std::to_string(std::time(nullptr)) + "}";
        }
        else if (request.find("POST /analyze") != std::string::npos) {
            // Extract JSON from request body
            size_t bodyStart = request.find("\r\n\r\n");
            if (bodyStart != std::string::npos) {
                std::string body = request.substr(bodyStart + 4);
                
                // Simple JSON parsing to extract "text" field
                std::regex textRegex("\"text\"\\s*:\\s*\"([^\"]+)\"");
                std::smatch match;
                
                if (std::regex_search(body, match, textRegex)) {
                    std::string text = match[1];
                    
                    // Unescape common JSON characters
                    size_t pos = 0;
                    while ((pos = text.find("\\n", pos)) != std::string::npos) {
                        text.replace(pos, 2, "\n");
                        pos += 1;
                    }
                    
                    PostAnalyzer::AnalysisResult result = analyzer.analyze(text);
                    std::string jsonResult = analyzer.resultToJson(result);
                    
                    response = "HTTP/1.1 200 OK\r\n";
                    response += "Content-Type: " + contentType + "\r\n";
                    response += "Access-Control-Allow-Origin: *\r\n";
                    response += "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n";
                    response += "Access-Control-Allow-Headers: Content-Type\r\n";
                    response += "\r\n";
                    response += jsonResult;
                } else {
                    response = "HTTP/1.1 400 Bad Request\r\n";
                    response += "Content-Type: " + contentType + "\r\n";
                    response += "\r\n";
                    response += "{\"error\":\"Missing text field\"}";
                }
            } else {
                response = "HTTP/1.1 400 Bad Request\r\n";
                response += "Content-Type: " + contentType + "\r\n";
                response += "\r\n";
                response += "{\"error\":\"Invalid request body\"}";
            }
        }
        else if (request.find("OPTIONS") != std::string::npos) {
            response = "HTTP/1.1 200 OK\r\n";
            response += "Access-Control-Allow-Origin: *\r\n";
            response += "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n";
            response += "Access-Control-Allow-Headers: Content-Type\r\n";
            response += "\r\n";
        }
        else {
            response = "HTTP/1.1 404 Not Found\r\n";
            response += "Content-Type: " + contentType + "\r\n";
            response += "\r\n";
            response += "{\"error\":\"Not found\"}";
        }

        send(clientSocket, response.c_str(), response.length(), 0);
        close(clientSocket);
    }
};

int main() {
    SimpleHTTPServer server;
    
    std::cout << "Starting C++ Analysis Service..." << std::endl;
    std::cout << "Health check: GET /health" << std::endl;
    std::cout << "Analyze text: POST /analyze" << std::endl;
    
    if (!server.start(8000)) {
        std::cerr << "Failed to start server" << std::endl;
        return 1;
    }

    return 0;
} 