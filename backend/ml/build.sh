#!/bin/bash
set -e

echo "Building ML Analysis Service..."

# Upgrade pip and install build tools
python -m pip install --upgrade pip
python -m pip install --upgrade setuptools wheel

# Install dependencies
pip install -r requirements.txt

echo "Build completed successfully!" 