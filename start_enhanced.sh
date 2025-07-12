#!/bin/bash

echo "🚀 Starting Enhanced Post Analyzer with ML Integration"
echo "=================================================="

# Function to check if a port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
}

# Function to kill processes on a port
kill_port() {
    if check_port $1; then
        echo "Killing process on port $1..."
        lsof -ti :$1 | xargs kill -9
        sleep 2
    fi
}

# Kill existing processes
echo "🧹 Cleaning up existing processes..."
kill_port 3000  # Frontend
kill_port 3001  # Backend
kill_port 8000  # C++ Service
kill_port 8001  # ML Service

# Start C++ Analysis Service
echo "🔧 Starting C++ Analysis Service..."
cd backend/cpp
./cpp_analyzer_server &
CPP_PID=$!
cd ../..

# Start ML Analysis Service
echo "🤖 Starting ML Analysis Service..."
cd backend/ml
./start_ml_service.sh &
ML_PID=$!
cd ../..

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 5

# Check if services are running
echo "🔍 Checking service health..."

# Check C++ service
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ C++ Analysis Service is running on port 8000"
else
    echo "❌ C++ Analysis Service failed to start"
fi

# Check ML service
if curl -s http://localhost:8001/health > /dev/null; then
    echo "✅ ML Analysis Service is running on port 8001"
else
    echo "❌ ML Analysis Service failed to start"
fi

# Start Backend
echo "🔧 Starting Backend Server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start Frontend
echo "🎨 Starting Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 All services started!"
echo "========================"
echo "Frontend:    http://localhost:3000"
echo "Backend:     http://localhost:3001"
echo "C++ Service: http://localhost:8000"
echo "ML Service:  http://localhost:8001"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $FRONTEND_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    kill $CPP_PID 2>/dev/null
    kill $ML_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait 