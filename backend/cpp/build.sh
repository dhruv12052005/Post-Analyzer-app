#!/bin/bash

# Build script for Post Analyzer C++ REST API Service

set -e

echo "Building Post Analyzer C++ REST API Service..."

# Check if we're in the right directory
if [ ! -f "rest_api.cpp" ]; then
    echo "Error: rest_api.cpp not found. Please run this script from the cpp directory."
    exit 1
fi

# Create build directory
mkdir -p build
cd build

# Configure with CMake
echo "Configuring with CMake..."
cmake -DCMAKE_BUILD_TYPE=Release ..

# Build the project
echo "Building the project..."
make -j$(nproc)

echo "Build completed successfully!"
echo "Executable location: build/bin/post_analyzer_rest"

# Copy executable to parent directory for easy access
cp bin/post_analyzer_rest ../post_analyzer_rest

echo "Executable copied to: post_analyzer_rest"
echo "You can now run: ./post_analyzer_rest" 