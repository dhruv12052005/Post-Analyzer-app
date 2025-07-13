#!/bin/bash
set -e

echo "Starting C++ Analysis Service..."

# Make sure the executable exists
if [ ! -f "cpp_analyzer_server" ]; then
    echo "Error: cpp_analyzer_server executable not found. Building..."
    g++ -o cpp_analyzer_server cpp_analyzer_server.cpp -std=c++17 -O2
fi

# Set port from environment variable or default to 8000
PORT=${PORT:-8000}

echo "Starting service on port $PORT..."
./cpp_analyzer_server 