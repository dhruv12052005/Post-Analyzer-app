#!/bin/bash
set -e

echo "Building C++ Analysis Service..."

# Install build tools if needed
apt-get update -qq
apt-get install -y g++ make

# Compile the C++ service
g++ -o post_analyzer_rest rest_api.cpp -std=c++17 -O2

echo "Build completed successfully!" 