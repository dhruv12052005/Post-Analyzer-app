# Post Analyzer Application Setup Guide

This guide will help you set up the complete Post Analyzer application with C++ integration and MySQL database.

## Prerequisites

### System Requirements
- **Operating System**: Linux, macOS, or Windows (with WSL)
- **Memory**: At least 4GB RAM
- **Storage**: At least 2GB free space
- **Network**: Internet connection for downloading dependencies

### Required Software

1. **Node.js** (v16 or higher)
2. **MySQL** (v8.0 or higher)
3. **Docker** (optional, for containerized deployment)
4. **C++ Compiler** (GCC 7+ or Clang 6+)
5. **CMake** (v3.10 or higher)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd post-analyzer-app
```

### 2. Install Node.js Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 3. Set Up MySQL Database

#### Option A: Local MySQL Installation

1. **Install MySQL**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install mysql-server

   # macOS (using Homebrew)
   brew install mysql

   # Start MySQL service
   sudo systemctl start mysql  # Linux
   brew services start mysql   # macOS
   ```

2. **Secure MySQL**:
   ```bash
   sudo mysql_secure_installation
   ```

3. **Create Database User**:
   ```bash
   sudo mysql -u root -p
   ```
   ```sql
   CREATE USER 'post_analyzer'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON post_analyzer.* TO 'post_analyzer'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

#### Option B: Docker MySQL

```bash
# Start MySQL with Docker
docker run --name post_analyzer_mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=post_analyzer \
  -e MYSQL_USER=post_analyzer \
  -e MYSQL_PASSWORD=password \
  -p 3306:3306 \
  -d mysql:8.0
```

### 4. Set Up Database Schema

```bash
# Run the database setup script
./scripts/setup-database.sh
```

Or manually:
```bash
mysql -u post_analyzer -p post_analyzer < database/migrations/001_initial_schema.sql
```

### 5. Build C++ Analysis Service

#### Install C++ Dependencies

**Ubuntu/Debian**:
```bash
sudo apt-get update
sudo apt-get install -y build-essential cmake libssl-dev libcrypto++-dev
```

**macOS**:
```bash
brew install cmake openssl
```

#### Build the Service

```bash
cd backend/cpp
./build.sh
```

### 6. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cd backend
cp .env.example .env  # if example exists
```

Edit `.env` with your configuration:

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

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
```

### 7. Start the Services

#### Development Mode

1. **Start C++ Analysis Service**:
   ```bash
   cd backend/cpp
   ./post_analyzer_rest
   ```

2. **Start Backend Server** (in a new terminal):
   ```bash
   cd backend
   npm run dev
   ```

3. **Start Frontend** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

#### Production Mode with Docker

```bash
# Build and start all services
docker-compose up --build
```

## Verification

### 1. Check C++ Service

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "cpp-analyzer",
  "timestamp": 1234567890
}
```

### 2. Check Backend API

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 3. Test Analysis

```bash
curl -X POST http://localhost:3001/api/posts/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a wonderful text for analysis. I love this application!"}'
```

### 4. Access Frontend

Open your browser and navigate to:
```
http://localhost:3000
```

## API Endpoints

### Posts
- `GET /api/posts` - Get all posts
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

## Troubleshooting

### Common Issues

1. **C++ Service Won't Build**:
   - Ensure all dependencies are installed
   - Check CMake version (requires 3.10+)
   - Verify compiler supports C++17

2. **Database Connection Issues**:
   - Verify MySQL is running
   - Check database credentials in `.env`
   - Ensure database exists and schema is applied

3. **C++ Service Not Available**:
   - Check if service is running on port 8000
   - Verify firewall settings
   - Check logs for error messages

4. **Frontend Can't Connect to Backend**:
   - Verify backend is running on port 3001
   - Check CORS settings
   - Ensure API_KEY is configured correctly

### Logs

- **Backend logs**: Check terminal where `npm run dev` is running
- **C++ service logs**: Check terminal where `./post_analyzer_rest` is running
- **Database logs**: Check MySQL error log
- **Frontend logs**: Check browser developer console

### Performance Monitoring

The application includes built-in performance monitoring:

1. **Analysis Statistics**: Check `/api/posts/analysis/stats`
2. **Processing Times**: Logged in database
3. **Service Health**: Health check endpoints

## Development

### Adding New Features

1. **Backend**: Add routes in `backend/src/routes/`
2. **C++ Service**: Modify `backend/cpp/rest_api.cpp`
3. **Database**: Add migrations in `database/migrations/`
4. **Frontend**: Update React components

### Testing

```bash
# Test C++ service
cd backend/cpp
./test_rest_api.sh

# Test backend API
cd backend
npm test

# Test frontend
cd frontend
npm test
```

## Deployment

### Docker Deployment

```bash
# Build and deploy with Docker Compose
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment

1. **Build production assets**:
   ```bash
   cd frontend && npm run build
   cd ../backend && npm run build
   ```

2. **Set up production environment**:
   - Configure production database
   - Set up reverse proxy (nginx)
   - Configure SSL certificates
   - Set up monitoring and logging

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review logs for error messages
3. Verify all prerequisites are installed
4. Test individual components separately

## Architecture Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │   Backend   │    │ C++ Service │
│  (React)    │◄──►│  (Node.js)  │◄──►│  (REST API) │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   MySQL     │
                    │  Database   │
                    └─────────────┘
```

The application uses a microservices architecture with:
- **Frontend**: React application for user interface
- **Backend**: Node.js API server for business logic
- **C++ Service**: High-performance text analysis
- **Database**: MySQL for data persistence 