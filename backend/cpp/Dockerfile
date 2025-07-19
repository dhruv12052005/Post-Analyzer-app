FROM ubuntu:20.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV CPP_SERVICE_PORT=8000

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    g++ \
    make \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy source files
COPY . .

# Make build script executable and build the service
RUN chmod +x build.sh && ./build.sh

# Create a startup script with proper logging
RUN echo '#!/bin/bash\n\
echo "=== C++ Analysis Service Container Starting ==="\n\
echo "Container started at: $(date)"\n\
echo "Environment variables:"\n\
echo "  CPP_SERVICE_PORT: $CPP_SERVICE_PORT"\n\
echo "  PORT: $PORT"\n\
echo "  HOSTNAME: $HOSTNAME"\n\
echo "  PWD: $(pwd)"\n\
echo "  Files in current directory:"\n\
ls -la\n\
echo ""\n\
echo "Testing binary..."\n\
if [ -x ./cpp_analyzer_server ]; then\n\
    echo "✅ Binary is executable"\n\
    echo "Binary size: $(ls -lh cpp_analyzer_server | awk \"{print \\$5}\")"\n\
else\n\
    echo "❌ Binary is not executable"\n\
    exit 1\n\
fi\n\
echo ""\n\
echo "Starting C++ Analysis Service..."\n\
echo "Using port: ${CPP_SERVICE_PORT:-8000}"\n\
echo "==============================================="\n\
exec ./cpp_analyzer_server\n\
' > start.sh && chmod +x start.sh

# Expose the port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start the service
CMD ["./start.sh"] 