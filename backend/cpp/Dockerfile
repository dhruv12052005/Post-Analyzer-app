FROM ubuntu:20.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV CMAKE_VERSION=3.22.1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Download and install httplib
RUN wget https://github.com/yhirose/cpp-httplib/archive/refs/tags/v0.12.5.tar.gz \
    && tar -xzf v0.12.5.tar.gz \
    && cp cpp-httplib-0.12.5/httplib.h /usr/local/include/ \
    && rm -rf cpp-httplib-0.12.5 v0.12.5.tar.gz

# Download and install nlohmann/json
RUN wget https://github.com/nlohmann/json/releases/download/v3.11.2/json.hpp \
    && mv json.hpp /usr/local/include/nlohmann/json.hpp

# Copy source code
COPY rest_api.cpp /app/
COPY CMakeLists_rest.txt /app/CMakeLists.txt

# Build the application
RUN cmake . && make

# Expose port
EXPOSE 8000

# Run the application
CMD ["./analyzer_rest"] 