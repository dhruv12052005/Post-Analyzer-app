#!/bin/bash

echo "Testing C++ Analysis Service..."

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s http://localhost:8000/health | jq .

echo -e "\n2. Testing analyze endpoint..."
curl -s -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a wonderful and amazing post about technology. I love programming and coding is fantastic!"}' \
  | jq .

echo -e "\n3. Testing with negative sentiment..."
curl -s -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "This is terrible and awful. I hate this post and it is horrible."}' \
  | jq .

echo -e "\nC++ Analysis Service test completed!" 