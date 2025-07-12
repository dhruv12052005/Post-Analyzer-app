#include <iostream>
#include <string>
#include "analyzer.cpp"

int main() {
    PostAnalyzer analyzer;
    
    std::string testText = "This is a wonderful post about technology. I love how amazing this content is. It's really great and fantastic to read.";
    
    std::cout << "Analyzing text: " << testText << std::endl;
    
    PostAnalyzer::AnalysisResult result = analyzer.analyze(testText);
    
    std::cout << "Analysis Results:" << std::endl;
    std::cout << "Word Count: " << result.wordCount << std::endl;
    std::cout << "Keyword Count: " << result.keywordCount << std::endl;
    std::cout << "Sentiment Score: " << result.sentimentScore << std::endl;
    std::cout << "Reading Time: " << result.readingTime << " minutes" << std::endl;
    
    std::cout << "Keywords: ";
    for (const auto& keyword : result.keywords) {
        std::cout << keyword << " ";
    }
    std::cout << std::endl;
    
    return 0;
} 