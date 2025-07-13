# Post Analyzer - Multi-Service Text Analysis Application

A full-stack web application that analyzes posts using multiple backend services. Built with Next.js frontend, Express.js backend, C++ analysis service, and Python ML service.

## 🚀 Features

### Frontend (Next.js)
- **Responsive Design**: Mobile-optimized interface with Tailwind CSS
- **Post Management**: View, create, edit, and delete posts
- **Pagination**: Efficient post browsing with pagination
- **Search & Filter**: Real-time search functionality
- **Post Analysis**: Detailed analysis with word count, keywords, sentiment, and reading time
- **Modal Interface**: Clean modal for creating new posts
- **Analysis History**: View analysis history and statistics

### Backend (Node.js + Express)
- **RESTful API**: Complete CRUD operations for posts
- **API Key Protection**: Secure endpoints with database-based API key authentication
- **SQLite Database**: Lightweight database for development and production
- **Multi-Service Integration**: Communicates with C++ and ML services
- **Error Handling**: Comprehensive error handling and logging
- **Analysis Logging**: Database logging of all analysis operations

### C++ Analysis Engine
- **High-Performance**: Optimized C++ implementation for fast text processing
- **Word Count Analysis**: Accurate word counting with punctuation handling
- **Keyword Extraction**: Intelligent keyword identification and ranking
- **Sentiment Analysis**: Advanced sentiment scoring based on word dictionaries
- **Reading Time**: Estimated reading time calculation
- **REST API**: HTTP endpoints for easy integration

### ML Service (Python/FastAPI)
- **Advanced Analysis**: Machine learning-based text analysis
- **Sentiment Analysis**: Enhanced sentiment scoring
- **Keyword Extraction**: ML-powered keyword identification
- **FastAPI**: High-performance Python web framework
- **REST API**: HTTP endpoints for integration

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   C++ Service   │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   (REST API)    │
│                 │    │                 │    │                 │
│ • React         │    │ • REST API      │    │ • Text Analysis │
│ • TypeScript    │    │ • Auth Middleware│   │ • Keyword Ext.  │
│ • Tailwind CSS  │    │ • SQLite DB     │    │ • Sentiment     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   ML Service    │
                       │   (Python)      │
                       │                 │
                       │ • FastAPI       │
                       │ • ML Analysis   │
                       │ • Sentiment     │
                       └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **Axios**: HTTP client for API calls

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **TypeScript**: Type-safe backend development
- **SQLite**: Lightweight database
- **sqlite3**: SQLite client
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing

### C++ Service
- **C++17**: Modern C++ features
- **CMake**: Build system
- **httplib**: HTTP server library
- **nlohmann/json**: JSON parsing
- **REST API**: HTTP endpoints for integration

### ML Service
- **Python 3.11**: Python runtime
- **FastAPI**: High-performance web framework
- **Uvicorn**: ASGI server
- **Machine Learning**: Text analysis libraries
- **REST API**: HTTP endpoints for integration

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.11+
- CMake 3.10+ (for C++ compilation)
- C++ Compiler (GCC 7+ or Clang 6+)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/post-analyzer-app.git
   cd post-analyzer-app
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   npm run build
   npm start
   ```

3. **Setup C++ Service**
   ```bash
   cd backend/cpp
   ./build.sh
   ./post_analyzer_rest
   ```

4. **Setup ML Service**
   ```bash
   cd backend/ml
   pip install -r requirements.txt
   python ml_service.py
   ```

5. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - C++ Service: http://localhost:8000
   - ML Service: http://localhost:8001

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration (SQLite)
DB_TYPE=sqlite
DB_PATH=./post_analyzer.db

# Service URLs
CPP_SERVICE_URL=http://localhost:8000
ML_SERVICE_URL=http://localhost:8001

# API Configuration
API_KEY=your-secret-api-key-here
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_API_KEY=your-secret-api-key-here
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend Services (Railway)
1. Deploy backend to Railway
2. Deploy C++ service to Railway
3. Deploy ML service to Railway
4. Set environment variables in Railway dashboard

### Database (SQLite)
- **Development**: Local SQLite file
- **Production**: SQLite file on Railway (persistent storage)

## 📊 API Endpoints

### Posts
- `GET /api/posts` - Get all posts with pagination
- `GET /api/posts/:id` - Get specific post
- `POST /api/posts` - Create new post (requires API key)
- `PUT /api/posts/:id` - Update post (requires API key)
- `DELETE /api/posts/:id` - Delete post (requires API key)

### Analysis
- `GET /api/posts/:id/analyze` - Analyze specific post
- `POST /api/posts/analyze` - Analyze text directly
- `GET /api/posts/:id/analysis-history` - Get analysis history
- `GET /api/posts/analysis/stats` - Get analysis statistics

### Sync
- `POST /api/posts/sync` - Sync posts from mock API (requires API key)

## 🔐 Authentication

### API Key System
- **Database Storage**: API keys stored in SQLite database
- **Header Authentication**: `X-API-Key` header required for protected endpoints
- **Default Key**: `your-secret-api-key-here` (for development)
- **Production**: Generate secure API keys for production

### Protected Endpoints
- POST `/api/posts` - Create posts
- PUT `/api/posts/:id` - Update posts
- DELETE `/api/posts/:id` - Delete posts
- POST `/api/posts/sync` - Sync posts

## 🧪 Testing

### Manual Testing
```bash
# Test backend health
curl http://localhost:3001/health

# Test C++ service
curl http://localhost:8000/health

# Test ML service
curl http://localhost:8001/health

# Test API with authentication
curl -H "X-API-Key: your-secret-api-key-here" \
     http://localhost:3001/api/posts
```

### Service Communication
- Frontend → Backend: HTTP API calls
- Backend → C++ Service: HTTP API calls
- Backend → ML Service: HTTP API calls
- All services communicate via localhost URLs

## 📈 Performance

### Current Setup
- **Frontend**: Next.js with Turbopack for fast development
- **Backend**: Express.js with SQLite for simplicity
- **C++ Service**: High-performance text analysis
- **ML Service**: Python-based ML analysis
- **Database**: SQLite for lightweight operation

### Scalability Considerations
- **Database**: Can migrate to PostgreSQL for production
- **Services**: Can deploy to cloud platforms (Railway, Render)
- **Caching**: Can add Redis for performance
- **Load Balancing**: Can add multiple service instances

## 🚨 Troubleshooting

### Common Issues
1. **Port Conflicts**: Ensure ports 3000, 3001, 8000, 8001 are available
2. **API Key Issues**: Check database for valid API keys
3. **Service Communication**: Verify all services are running
4. **Database Issues**: Check SQLite file permissions

### Debug Commands
```bash
# Check service status
curl http://localhost:3001/health
curl http://localhost:8000/health
curl http://localhost:8001/health

# Check database
sqlite3 backend/post_analyzer.db ".tables"
```

## 🎉 Success Checklist

- [ ] All services running on their ports
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend API responding at http://localhost:3001
- [ ] C++ service running at http://localhost:8000
- [ ] ML service running at http://localhost:8001
- [ ] API key authentication working
- [ ] Post analysis functionality working
- [ ] Database operations working

Your application is ready for development and deployment! 🚀 