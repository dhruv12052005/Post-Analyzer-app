#!/bin/bash

echo "Starting ML Analysis Service..."
echo "Health check: GET http://localhost:8001/health"
echo "Analyze text: POST http://localhost:8001/analyze"
echo "Get categories: GET http://localhost:8001/categories"

# Install dependencies if not already installed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

# Start the ML service
python ml_service.py 