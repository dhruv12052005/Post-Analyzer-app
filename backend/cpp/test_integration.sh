#!/bin/bash

# Integration test script for C++ Analysis Service

set -e

echo "Testing C++ Analysis Service Integration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
        exit 1
    fi
}

# Check if C++ service is running
echo "1. Checking if C++ service is running..."
if curl -s http://localhost:8000/health > /dev/null; then
    print_status 0 "C++ service is running"
else
    print_status 1 "C++ service is not running. Please start it with: ./post_analyzer_rest"
fi

# Test C++ service directly
echo "2. Testing C++ service directly..."
CPP_RESPONSE=$(curl -s -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a wonderful test text for analysis. I love this application!"}')

if echo "$CPP_RESPONSE" | grep -q "wordCount"; then
    print_status 0 "C++ service analysis working"
    echo "   Response: $CPP_RESPONSE"
else
    print_status 1 "C++ service analysis failed"
    echo "   Response: $CPP_RESPONSE"
fi

# Check if backend is running
echo "3. Checking if backend is running..."
if curl -s http://localhost:3001/health > /dev/null; then
    print_status 0 "Backend service is running"
else
    print_status 1 "Backend service is not running. Please start it with: npm run dev"
fi

# Test backend analysis endpoint
echo "4. Testing backend analysis endpoint..."
BACKEND_RESPONSE=$(curl -s -X POST http://localhost:3001/api/posts/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a wonderful test text for analysis. I love this application!"}')

if echo "$BACKEND_RESPONSE" | grep -q "success.*true"; then
    print_status 0 "Backend analysis endpoint working"
    echo "   Response: $BACKEND_RESPONSE"
else
    print_status 1 "Backend analysis endpoint failed"
    echo "   Response: $BACKEND_RESPONSE"
fi

# Test analysis statistics
echo "5. Testing analysis statistics endpoint..."
STATS_RESPONSE=$(curl -s http://localhost:3001/api/posts/analysis/stats)

if echo "$STATS_RESPONSE" | grep -q "success.*true"; then
    print_status 0 "Analysis statistics endpoint working"
    echo "   Response: $STATS_RESPONSE"
else
    print_status 1 "Analysis statistics endpoint failed"
    echo "   Response: $STATS_RESPONSE"
fi

# Performance test
echo "6. Running performance test..."
START_TIME=$(date +%s.%N)
for i in {1..5}; do
    curl -s -X POST http://localhost:3001/api/posts/analyze \
      -H "Content-Type: application/json" \
      -d '{"text": "This is test text number '$i' for performance testing."}' > /dev/null
done
END_TIME=$(date +%s.%N)

ELAPSED=$(echo "$END_TIME - $START_TIME" | bc)
AVERAGE=$(echo "scale=3; $ELAPSED / 5" | bc)

echo -e "${YELLOW}Performance: 5 requests completed in ${ELAPSED}s (avg: ${AVERAGE}s per request)${NC}"

echo ""
echo -e "${GREEN}All integration tests passed!${NC}"
echo ""
echo "Services are working correctly:"
echo "  - C++ Analysis Service: http://localhost:8000"
echo "  - Backend API: http://localhost:3001"
echo "  - Frontend: http://localhost:3000" 