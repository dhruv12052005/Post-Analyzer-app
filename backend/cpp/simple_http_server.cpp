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
#include <ctime>
#include <chrono>
#include <iomanip> // Required for std::put_time and std::setfill/setw
#include <errno.h> // Required for errno

// Enhanced logging function
void logMessage(const std::string& level, const std::string& message) {
    auto now = std::chrono::system_clock::now();
    auto time_t = std::chrono::system_clock::to_time_t(now);
    auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch()) % 1000;
    
    std::cout << "[" << std::put_time(std::localtime(&time_t), "%Y-%m-%d %H:%M:%S") 
              << "." << std::setfill('0') << std::setw(3) << ms.count() << "] "
              << "[" << level << "] " << message << std::endl;
}

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
    SimpleHTTPServer() : running(false) {
        logMessage("INFO", "C++ Analysis Service initialized");
    }

    bool start(int port = 8000) {
        logMessage("INFO", "Starting C++ Analysis Service...");
        logMessage("INFO", "Attempting to create socket...");
        
        serverSocket = socket(AF_INET, SOCK_STREAM, 0);
        if (serverSocket < 0) {
            logMessage("ERROR", "Failed to create socket: " + std::string(strerror(errno)));
            return false;
        }
        logMessage("INFO", "Socket created successfully");

        int opt = 1;
        if (setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) < 0) {
            logMessage("WARN", "Failed to set SO_REUSEADDR: " + std::string(strerror(errno)));
        }

        struct sockaddr_in serverAddr;
        serverAddr.sin_family = AF_INET;
        serverAddr.sin_addr.s_addr = INADDR_ANY;
        serverAddr.sin_port = htons(port);

        logMessage("INFO", "Attempting to bind to port " + std::to_string(port));
        if (bind(serverSocket, (struct sockaddr*)&serverAddr, sizeof(serverAddr)) < 0) {
            logMessage("ERROR", "Failed to bind socket to port " + std::to_string(port) + ": " + std::string(strerror(errno)));
            close(serverSocket);
            return false;
        }
        logMessage("INFO", "Successfully bound to port " + std::to_string(port));

        logMessage("INFO", "Attempting to listen for connections...");
        if (listen(serverSocket, 5) < 0) {
            logMessage("ERROR", "Failed to listen: " + std::string(strerror(errno)));
            close(serverSocket);
            return false;
        }

        running = true;
        logMessage("INFO", "C++ Analysis Service is now running and listening on port " + std::to_string(port));
        logMessage("INFO", "Available endpoints:");
        logMessage("INFO", "  - GET /health (health check)");
        logMessage("INFO", "  - POST /analyze (text analysis)");
        
        while (running) {
            struct sockaddr_in clientAddr;
            socklen_t clientLen = sizeof(clientAddr);
            
            logMessage("DEBUG", "Waiting for client connection...");
            int clientSocket = accept(serverSocket, (struct sockaddr*)&clientAddr, &clientLen);
            
            if (clientSocket < 0) {
                logMessage("ERROR", "Failed to accept connection: " + std::string(strerror(errno)));
                continue;
            }

            char clientIP[INET_ADDRSTRLEN];
            inet_ntop(AF_INET, &clientAddr.sin_addr, clientIP, INET_ADDRSTRLEN);
            logMessage("INFO", "New connection accepted from " + std::string(clientIP) + ":" + std::to_string(ntohs(clientAddr.sin_port)));

            std::thread([this, clientSocket, clientIP]() {
                handleClient(clientSocket, clientIP);
            }).detach();
        }

        return true;
    }

    void stop() {
        logMessage("INFO", "Stopping C++ Analysis Service...");
        running = false;
        close(serverSocket);
        logMessage("INFO", "C++ Analysis Service stopped");
    }

private:
    void handleClient(int clientSocket, const std::string& clientIP) {
        char buffer[4096];
        logMessage("DEBUG", "Handling request from " + clientIP);
        
        int bytesRead = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);
        
        if (bytesRead <= 0) {
            logMessage("WARN", "No data received from " + clientIP + ", closing connection");
            close(clientSocket);
            return;
        }

        buffer[bytesRead] = '\0';
        std::string request(buffer);
        
        logMessage("DEBUG", "Received request from " + clientIP + " (" + std::to_string(bytesRead) + " bytes)");

        std::string response;
        std::string contentType = "application/json";

        if (request.find("GET /health") != std::string::npos) {
            logMessage("INFO", "Health check request from " + clientIP);
            
            // Create detailed health response
            std::string healthJson = "{";
            healthJson += "\"status\":\"ok\",";
            healthJson += "\"service\":\"cpp-analyzer\",";
            healthJson += "\"version\":\"1.0.0\",";
            healthJson += "\"timestamp\":" + std::to_string(std::time(nullptr)) + ",";
            healthJson += "\"uptime\":\"running\",";
            healthJson += "\"endpoints\":{";
            healthJson += "\"health\":\"GET /health\",";
            healthJson += "\"analyze\":\"POST /analyze\"";
            healthJson += "},";
            healthJson += "\"capabilities\":{";
            healthJson += "\"sentiment_analysis\":true,";
            healthJson += "\"keyword_extraction\":true,";
            healthJson += "\"word_counting\":true,";
            healthJson += "\"reading_time\":true";
            healthJson += "}";
            healthJson += "}";
            
            response = "HTTP/1.1 200 OK\r\n";
            response += "Content-Type: " + contentType + "\r\n";
            response += "Access-Control-Allow-Origin: *\r\n";
            response += "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n";
            response += "Access-Control-Allow-Headers: Content-Type\r\n";
            response += "\r\n";
            response += healthJson;
        }
        else if (request.find("POST /analyze") != std::string::npos) {
            logMessage("INFO", "Analysis request from " + clientIP);
            
            // Extract JSON from request body
            size_t bodyStart = request.find("\r\n\r\n");
            if (bodyStart != std::string::npos) {
                std::string body = request.substr(bodyStart + 4);
                logMessage("DEBUG", "Request body length: " + std::to_string(body.length()));
                logMessage("DEBUG", "Raw request body: " + body);
                
                // Simple JSON parsing to extract "text" field
                std::regex textRegex("\"text\"\\s*:\\s*\"([^\"]+)\"");
                std::smatch match;
                
                if (std::regex_search(body, match, textRegex)) {
                    std::string text = match[1];
                    logMessage("DEBUG", "Extracted text length: " + std::to_string(text.length()));
                    logMessage("DEBUG", "Extracted text: \"" + text + "\"");
                    
                    // Unescape common JSON characters
                    size_t pos = 0;
                    while ((pos = text.find("\\n", pos)) != std::string::npos) {
                        text.replace(pos, 2, "\n");
                        pos += 1;
                    }
                    
                    // Unescape quotes
                    pos = 0;
                    while ((pos = text.find("\\\"", pos)) != std::string::npos) {
                        text.replace(pos, 2, "\"");
                        pos += 1;
                    }
                    
                    logMessage("INFO", "Processing text: \"" + text.substr(0, std::min(100UL, text.length())) + (text.length() > 100 ? "..." : "\""));
                    
                    PostAnalyzer::AnalysisResult result = analyzer.analyze(text);
                    std::string jsonResult = analyzer.resultToJson(result);
                    
                    logMessage("INFO", "Analysis completed for " + clientIP + " - Word count: " + std::to_string(result.wordCount) + ", Sentiment: " + std::to_string(result.sentimentScore));
                    logMessage("DEBUG", "Generated JSON response: " + jsonResult);
                    
                    response = "HTTP/1.1 200 OK\r\n";
                    response += "Content-Type: " + contentType + "\r\n";
                    response += "Access-Control-Allow-Origin: *\r\n";
                    response += "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n";
                    response += "Access-Control-Allow-Headers: Content-Type\r\n";
                    response += "\r\n";
                    response += jsonResult;
                } else {
                    logMessage("ERROR", "Missing text field in request from " + clientIP);
                    logMessage("ERROR", "Failed to parse JSON body: " + body);
                    response = "HTTP/1.1 400 Bad Request\r\n";
                    response += "Content-Type: " + contentType + "\r\n";
                    response += "\r\n";
                    response += "{\"error\":\"Missing text field\"}";
                }
            } else {
                logMessage("ERROR", "Invalid request body from " + clientIP);
                logMessage("ERROR", "No body separator found in request");
                response = "HTTP/1.1 400 Bad Request\r\n";
                response += "Content-Type: " + contentType + "\r\n";
                response += "\r\n";
                response += "{\"error\":\"Invalid request body\"}";
            }
        }
        else if (request.find("OPTIONS") != std::string::npos) {
            logMessage("DEBUG", "OPTIONS request from " + clientIP);
            response = "HTTP/1.1 200 OK\r\n";
            response += "Access-Control-Allow-Origin: *\r\n";
            response += "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n";
            response += "Access-Control-Allow-Headers: Content-Type\r\n";
            response += "\r\n";
        }
        else {
            logMessage("WARN", "Unknown request from " + clientIP + ": " + request.substr(0, std::min(100UL, request.length())));
            response = "HTTP/1.1 404 Not Found\r\n";
            response += "Content-Type: " + contentType + "\r\n";
            response += "\r\n";
            response += "{\"error\":\"Not found\"}";
        }

        ssize_t bytesSent = send(clientSocket, response.c_str(), response.length(), 0);
        if (bytesSent < 0) {
            logMessage("ERROR", "Failed to send response to " + clientIP + ": " + std::string(strerror(errno)));
        } else {
            logMessage("DEBUG", "Sent " + std::to_string(bytesSent) + " bytes to " + clientIP);
        }
        
        close(clientSocket);
        logMessage("DEBUG", "Connection closed for " + clientIP);
    }
};

int main() {
    logMessage("INFO", "=== C++ Analysis Service Starting ===");
    logMessage("INFO", "Version: 1.0.0");
    logMessage("INFO", "Build: " + std::string(__DATE__) + " " + std::string(__TIME__));
    
    SimpleHTTPServer server;
    
    logMessage("INFO", "Starting C++ Analysis Service...");
    logMessage("INFO", "Health check: GET /health");
    logMessage("INFO", "Analyze text: POST /analyze");
    
    // Try to get port from environment variable, default to 8000
    const char* portEnv = std::getenv("CPP_SERVICE_PORT");
    int port = portEnv ? std::atoi(portEnv) : 8000;
    logMessage("INFO", "Using port: " + std::to_string(port));
    
    if (!server.start(port)) {
        logMessage("ERROR", "Failed to start server on port " + std::to_string(port));
        logMessage("ERROR", "Please check if port is available and you have sufficient permissions");
        return 1;
    }

    logMessage("INFO", "=== C++ Analysis Service Exiting ===");
    return 0;
} 