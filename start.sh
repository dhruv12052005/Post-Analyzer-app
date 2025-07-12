#!/bin/bash

echo "🚀 Starting Post Analyzer Application..."
echo "========================================"

# Check if Docker is available
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "🐳 Using Docker Compose for easy setup..."
    echo "Starting all services..."
    docker-compose up -d
    
    echo ""
    echo "✅ Application is starting up!"
    echo "📱 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:3001"
    echo "🗄️  Database: localhost:5432"
    echo ""
    echo "⏳ Please wait a few moments for all services to be ready..."
    echo "You can check the status with: docker-compose ps"
    
else
    echo "📦 Manual setup mode..."
    echo ""
    echo "Please ensure you have:"
    echo "1. PostgreSQL running on localhost:5432"
    echo "2. Node.js 18+ installed"
    echo "3. Environment variables configured"
    echo ""
    echo "To start manually:"
    echo "1. Backend: cd backend && npm run dev"
    echo "2. Frontend: cd frontend && npm run dev"
fi

echo ""
echo "📚 For more information, see README.md" 