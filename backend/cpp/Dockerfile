FROM ubuntu:22.04

# Install build tools and dependencies
RUN apt-get update && apt-get install -y g++ make cmake libssl-dev libcrypto++-dev

WORKDIR /app

# Copy source code
COPY . .

# Build the C++ REST API service
RUN g++ -o post_analyzer_rest rest_api.cpp -std=c++17 -O2

EXPOSE 8000

CMD ["./post_analyzer_rest"] 