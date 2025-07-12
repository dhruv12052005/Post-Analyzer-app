from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
from typing import Dict, List, Any
import json
import re
try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    VADER_AVAILABLE = True
except ImportError:
    VADER_AVAILABLE = False

try:
    from textblob import TextBlob
    TEXTBLOB_AVAILABLE = True
except ImportError:
    TEXTBLOB_AVAILABLE = False

app = FastAPI(title="Post Analyzer ML Service", version="1.0.0")

# Initialize VADER sentiment analyzer
if VADER_AVAILABLE:
    vader_analyzer = SentimentIntensityAnalyzer()

# Simple text classification categories
TEXT_CATEGORIES = {
    'technical': ['code', 'programming', 'algorithm', 'database', 'api', 'framework', 'bug', 'debug', 'software', 'development'],
    'personal': ['family', 'friend', 'relationship', 'love', 'life', 'experience', 'story', 'home', 'personal'],
    'business': ['company', 'startup', 'market', 'investment', 'strategy', 'profit', 'growth', 'business', 'corporate'],
    'news': ['politics', 'election', 'government', 'policy', 'economy', 'world', 'breaking', 'news', 'current'],
    'entertainment': ['movie', 'music', 'game', 'celebrity', 'show', 'performance', 'art', 'entertainment', 'fun']
}

class TextAnalysisRequest(BaseModel):
    text: str

class TextAnalysisResponse(BaseModel):
    sentiment_score: float
    sentiment_label: str
    subjectivity_score: float
    text_category: str
    category_confidence: float
    key_phrases: List[str]
    word_count: int
    reading_time_minutes: float

class HealthResponse(BaseModel):
    status: str
    message: str

# Initialize simple text classifier
def create_simple_classifier():
    """Create a simple rule-based text classifier"""
    def classify_text(text: str) -> tuple[str, float]:
        text_lower = text.lower()
        scores = {}
        
        for category, keywords in TEXT_CATEGORIES.items():
            score = 0
            for keyword in keywords:
                if keyword in text_lower:
                    score += 1
            scores[category] = score
        
        if not any(scores.values()):
            return 'general', 0.1
        
        best_category = max(scores, key=lambda k: scores[k])
        confidence = min(0.9, scores[best_category] / len(TEXT_CATEGORIES[best_category]))
        return best_category, confidence
    
    return classify_text

classifier = create_simple_classifier()

def extract_key_phrases_simple(text: str, num_phrases: int = 5) -> List[str]:
    """Extract key phrases using simple NLP techniques"""
    # Remove punctuation and split into words
    words = re.findall(r'\b\w+\b', text.lower())
    
    # Filter out common stop words
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'}
    
    # Get words that are not stop words and longer than 3 characters
    key_words = [word for word in words if word not in stop_words and len(word) > 3]
    
    # Count frequency
    word_freq = {}
    for word in key_words:
        word_freq[word] = word_freq.get(word, 0) + 1
    
    # Get top words by frequency
    sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
    return [word for word, freq in sorted_words[:num_phrases]]

def vader_sentiment_analysis(text: str) -> tuple[float, float]:
    if not VADER_AVAILABLE:
        raise ImportError("VADER is not installed.")
    scores = vader_analyzer.polarity_scores(text)
    polarity = scores['compound']  # VADER compound score
    subjectivity = 1.0 - abs(scores['compound'])  # Subjectivity based on neutrality
    return polarity, subjectivity

def textblob_sentiment_analysis(text: str) -> tuple[float, float]:
    if not TEXTBLOB_AVAILABLE:
        raise ImportError("TextBlob is not installed.")
    blob = TextBlob(text)
    # type: ignore is used to silence linter for dynamic attributes
    polarity = getattr(blob.sentiment, 'polarity', 0.0)  # type: ignore
    subjectivity = getattr(blob.sentiment, 'subjectivity', 0.5)  # type: ignore
    return polarity, subjectivity

def simple_sentiment_analysis(text: str) -> tuple[float, float]:
    positive_words = {'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'enjoy', 'happy', 'joy', 'pleased', 'satisfied', 'perfect', 'best', 'awesome', 'brilliant', 'outstanding', 'superb', 'terrific', 'cool', 'positive', 'delightful', 'thrilled', 'excited', 'satisfied', 'pleased'}
    negative_words = {'bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'sad', 'angry', 'frustrated', 'disappointed', 'worst', 'terrible', 'awful', 'dreadful', 'miserable', 'upset', 'annoyed', 'irritated'}
    words = re.findall(r'\b\w+\b', text.lower())
    positive_count = sum(1 for word in words if word in positive_words)
    negative_count = sum(1 for word in words if word in negative_words)
    total_words = len(words)
    if total_words == 0:
        return 0.0, 0.5
    polarity = (positive_count - negative_count) / total_words
    emotional_words = positive_count + negative_count
    subjectivity = min(1.0, emotional_words / total_words)
    return polarity, subjectivity

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="ML service is running"
    )

@app.post("/analyze", response_model=TextAnalysisResponse)
async def analyze_text(request: TextAnalysisRequest):
    try:
        text = request.text.strip()
        if not text:
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Try VADER first, then TextBlob, then fallback
        try:
            sentiment_score, subjectivity_score = vader_sentiment_analysis(text)
        except Exception:
            try:
                sentiment_score, subjectivity_score = textblob_sentiment_analysis(text)
            except Exception:
                sentiment_score, subjectivity_score = simple_sentiment_analysis(text)
        
        # Determine sentiment label
        if sentiment_score > 0.1:
            sentiment_label = "positive"
        elif sentiment_score < -0.1:
            sentiment_label = "negative"
        else:
            sentiment_label = "neutral"
        
        # Text classification
        text_category, category_confidence = classifier(text)
        
        # Extract key phrases
        key_phrases = extract_key_phrases_simple(text)
        
        # Calculate metrics
        word_count = len(text.split())
        reading_time_minutes = word_count / 200.0  # Average reading speed
        
        return TextAnalysisResponse(
            sentiment_score=sentiment_score,
            sentiment_label=sentiment_label,
            subjectivity_score=subjectivity_score,
            text_category=text_category,
            category_confidence=category_confidence,
            key_phrases=key_phrases,
            word_count=word_count,
            reading_time_minutes=reading_time_minutes
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/categories")
async def get_categories():
    """Get available text categories"""
    return {
        "categories": list(TEXT_CATEGORIES.keys()),
        "keywords": TEXT_CATEGORIES
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 