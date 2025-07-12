# Post Analyzer - Advanced C++ Text Analysis Application

A full-stack web application that analyzes posts using C++ backend logic, MySQL database, and high-performance text analysis. Built with Next.js, Express.js, and C++ REST API service.

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
- **API Key Protection**: Secure endpoints with API key authentication
- **Database Integration**: MySQL with connection pooling
- **C++ Integration**: High-performance C++ analysis service
- **Error Handling**: Comprehensive error handling and logging
- **Analysis Logging**: Database logging of all analysis operations

### C++ Analysis Engine
- **High-Performance**: Optimized C++ implementation for fast text processing
- **Word Count Analysis**: Accurate word counting with punctuation handling
- **Keyword Extraction**: Intelligent keyword identification and ranking
- **Sentiment Analysis**: Advanced sentiment scoring based on word dictionaries
- **Reading Time**: Estimated reading time calculation
- **REST API**: HTTP endpoints for easy integration
- **Fallback Support**: JavaScript fallback when C++ service is unavailable

### Database (MySQL)
- **Post Storage**: Structured post data with timestamps
- **Analysis Logs**: Comprehensive tracking of analysis operations
- **Performance Metrics**: Processing time and analysis statistics
- **Data Sync**: Automatic sync with mock API data
- **Connection Pooling**: Efficient database connections

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   C++ Service   │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   (REST API)    │
│                 │    │                 │    │                 │
│ • React         │    │ • REST API      │    │ • Text Analysis │
│ • TypeScript    │    │ • Auth Middleware│   │ • Keyword Ext.  │
│ • Tailwind CSS  │    │ • Analysis Log  │    │ • Sentiment     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   MySQL         │
                       │   Database      │
                       │                 │
                       │ • Posts Table   │
                       │ • Analysis Logs │
                       │ • Users Table   │
                       │ • API Keys      │
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
- **MySQL**: Primary database
- **mysql2**: MySQL client with connection pooling
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing

### C++ Integration
- **C++17**: Modern C++ features
- **CMake**: Build system
- **httplib**: HTTP server library
- **nlohmann/json**: JSON parsing
- **REST API**: HTTP endpoints for integration

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-service orchestration
- **GitHub Actions**: CI/CD pipeline
- **Vercel**: Frontend deployment
- **Railway**: Backend deployment

## 📦 Installation

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- Docker & Docker Compose (optional)
- CMake 3.10+ (for C++ compilation)
- C++ Compiler (GCC 7+ or Clang 6+)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/post-analyzer-app.git
   cd post-analyzer-app
   ```

2. **Set environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - C++ Service: http://localhost:8000
   - Database: localhost:3306

### Manual Installation

1. **Setup Database**
   ```bash
   # Install MySQL
   # Create database and user
   mysql -u root -p
   CREATE DATABASE post_analyzer;
   CREATE USER 'post_analyzer'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON post_analyzer.* TO 'post_analyzer'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   
   # Run database setup
   ./scripts/setup-database.sh
   ```

2. **Build C++ Service**
   ```bash
   cd backend/cpp
   ./build.sh
   ```

3. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npm run dev
   ```

4. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Start C++ Service**
   ```bash
   cd backend/cpp
   ./post_analyzer_rest
   ```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=post_analyzer
DB_USER=post_analyzer
DB_PASSWORD=password

# C++ Service Configuration
CPP_SERVICE_URL=http://localhost:8000

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

### Backend (Railway/Render)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically via GitHub Actions

### C++ Service
- **Development**: Local compilation and execution
- **Production**: Docker containerization
- **Scaling**: Multiple instances behind load balancer

### Database (MySQL)
- **Development**: Local MySQL instance
- **Production**: Managed MySQL service (AWS RDS, Google Cloud SQL, etc.)

## 📊 API Endpoints

### Posts
- `GET /api/posts` - Get all posts with pagination
- `GET /api/posts/:id` - Get specific post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Analysis
- `GET /api/posts/:id/analyze` - Analyze specific post
- `POST /api/posts/analyze` - Analyze text directly
- `GET /api/posts/:id/analysis-history` - Get analysis history
- `GET /api/posts/analysis/stats` - Get analysis statistics

### Sync
- `POST /api/posts/sync` - Sync posts from mock API

## 🧪 Testing

### Integration Testing
```bash
# Test C++ service integration
cd backend/cpp
./test_integration.sh
```

### Manual Testing
```bash
# Test C++ service
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a test text for analysis."}'

# Test backend API
curl -X POST http://localhost:3001/api/posts/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a test text for analysis."}'
```

## 📈 Performance

The C++ implementation provides significant performance improvements:

- **Speed**: 5-10x faster than JavaScript implementation
- **Memory**: More efficient memory usage
- **CPU**: Better CPU utilization for text processing
- **Scalability**: Can handle high-volume text analysis

## 🔍 Monitoring

The application includes comprehensive monitoring:

- **Analysis Statistics**: Track C++ vs JavaScript analysis usage
- **Processing Times**: Monitor analysis performance
- **Service Health**: Health check endpoints for all services
- **Database Metrics**: Connection pool and query performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
1. Check the troubleshooting section in SETUP.md
2. Review the logs for error messages
3. Test individual components separately
4. Open an issue on GitHub 