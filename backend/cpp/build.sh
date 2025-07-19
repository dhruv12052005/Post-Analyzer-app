#!/bin/bash

echo "=== Building C++ Analysis Service ==="
echo "Build started at: $(date)"
echo "Current directory: $(pwd)"

# Check if we're on a supported platform
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Platform: Linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Platform: macOS"
else
    echo "Warning: Unknown platform $OSTYPE"
fi

# Check for required tools
echo "Checking for required tools..."

if ! command -v g++ &> /dev/null; then
    echo "ERROR: g++ compiler not found. Please install g++"
    exit 1
fi

if ! command -v make &> /dev/null; then
    echo "WARNING: make not found, but continuing..."
fi

echo "g++ version: $(g++ --version | head -n1)"
echo "make version: $(make --version | head -n1)"

# Clean previous builds
echo "Cleaning previous builds..."
rm -f cpp_analyzer_server
rm -f post_analyzer_simple

# Compile with enhanced flags
echo "Compiling C++ Analysis Service..."

# Add debug symbols and optimization
CXXFLAGS="-std=c++17 -Wall -Wextra -O2 -g -DDEBUG"

# Compile the main server
echo "Building cpp_analyzer_server..."
g++ $CXXFLAGS -o cpp_analyzer_server simple_http_server.cpp -pthread

if [ $? -eq 0 ]; then
    echo "✅ cpp_analyzer_server built successfully"
    echo "Binary size: $(ls -lh cpp_analyzer_server | awk '{print $5}')"
    
    # Test if the binary is executable
    if [ -x cpp_analyzer_server ]; then
        echo "✅ Binary is executable"
    else
        echo "❌ Binary is not executable"
        chmod +x cpp_analyzer_server
        echo "✅ Made binary executable"
    fi
else
    echo "❌ Failed to build cpp_analyzer_server"
    exit 1
fi

# Also build the simple version for testing
echo "Building post_analyzer_simple..."
g++ $CXXFLAGS -o post_analyzer_simple analyzer.cpp

if [ $? -eq 0 ]; then
    echo "✅ post_analyzer_simple built successfully"
else
    echo "❌ Failed to build post_analyzer_simple"
fi

echo "=== Build completed at: $(date) ==="
echo "Available binaries:"
ls -la cpp_analyzer_server post_analyzer_simple 2>/dev/null || echo "Some binaries may not have been built"

echo ""
echo "To start the service:"
echo "  ./cpp_analyzer_server"
echo ""
echo "To test the service:"
echo "  curl -X GET http://localhost:8000/health"
echo "  curl -X POST http://localhost:8000/analyze -H 'Content-Type: application/json' -d '{\"text\":\"test\"}'" 