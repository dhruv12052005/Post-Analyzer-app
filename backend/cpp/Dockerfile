FROM ubuntu:22.04

# Install build tools and dependencies
RUN apt-get update && apt-get install -y g++ make

WORKDIR /app

# Copy source code
COPY . .

# Build the C++ REST API service (using simple_http_server.cpp which has no external dependencies)
RUN g++ -o post_analyzer_rest simple_http_server.cpp -std=c++17 -O2 -pthread

EXPOSE 8000

CMD ["./post_analyzer_rest"] 