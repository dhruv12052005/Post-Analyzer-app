#!/bin/bash
set -e

echo "Starting C++ Analysis Service..."

# Make sure the executable exists
if [ ! -f "post_analyzer_rest" ]; then
    echo "Error: post_analyzer_rest executable not found. Building..."
    g++ -o post_analyzer_rest simple_http_server.cpp -std=c++17 -O2 -pthread
fi

# Set port from environment variable or default to 8000
PORT=${PORT:-8000}

echo "Starting service on port $PORT..."
./post_analyzer_rest 