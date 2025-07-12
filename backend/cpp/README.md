# C++ Analysis Service

This directory contains the C++ implementation of the post analysis service, providing high-performance text analysis capabilities.

## Overview

The C++ service provides:
- **Text Analysis**: Word count, keyword extraction, sentiment analysis
- **REST API**: HTTP endpoints for integration with the Node.js backend
- **Performance**: Optimized C++ implementation for fast processing
- **Fallback Support**: Node.js backend falls back to JavaScript analysis if C++ service is unavailable

## Files

- `analyzer.cpp` - Core analysis logic with WebAssembly exports
- `rest_api.cpp` - REST API server implementation
- `CMakeLists.txt` - CMake configuration for WebAssembly build
- `CMakeLists_rest.txt` - CMake configuration for REST API build
- `build.sh` - Build script for the REST API service
- `Dockerfile` - Docker configuration for containerization

## Building the REST API Service

### Prerequisites

1. **C++ Compiler**: GCC 7+ or Clang 6+
2. **CMake**: Version 3.10 or higher
3. **Development Libraries**: 
   - `libssl-dev` (for HTTPS support)
   - `libcrypto++-dev` (for cryptography)

### Ubuntu/Debian Dependencies

```bash
sudo apt-get update
sudo apt-get install -y build-essential cmake libssl-dev libcrypto++-dev
```

### macOS Dependencies

```bash
# Install with Homebrew
brew install cmake openssl

# Or install with MacPorts
sudo port install cmake openssl
```

### Building

1. **Navigate to the C++ directory**:
   ```bash
   cd backend/cpp
   ```

2. **Run the build script**:
   ```bash
   ./build.sh
   ```

3. **Or build manually**:
   ```bash
   mkdir -p build
   cd build
   cmake -DCMAKE_BUILD_TYPE=Release ..
   make -j$(nproc)
   ```

### Running the Service

After building, you can run the service:

```bash
# From the cpp directory
./post_analyzer_rest

# Or from the build directory
./build/bin/post_analyzer_rest
```

The service will start on port 8000 by default.

## API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "ok",
  "service": "cpp-analyzer",
  "timestamp": 1234567890
}
```

### Text Analysis
```
POST /analyze
Content-Type: application/json

{
  "text": "Your text to analyze here..."
}
```

Response:
```json
{
  "wordCount": 150,
  "keywordCount": 5,
  "sentimentScore": 0.25,
  "keywords": ["analysis", "text", "processing", "algorithm", "performance"],
  "readingTime": 1
}
```

## Analysis Features

### Word Count
- Counts total words in the text
- Filters out punctuation and whitespace

### Keyword Extraction
- Extracts the most frequent words (excluding stop words)
- Returns top 5 keywords by frequency
- Filters words shorter than 4 characters

### Sentiment Analysis
- Uses predefined positive and negative word lists
- Calculates sentiment score on a scale of -1 to 1
- -1: Very negative, 0: Neutral, 1: Very positive

### Reading Time
- Estimates reading time based on 200 words per minute
- Returns time in minutes

## Integration with Node.js Backend

The Node.js backend automatically integrates with the C++ service:

1. **Primary Analysis**: Backend calls C++ service for analysis
2. **Fallback**: If C++ service is unavailable, falls back to JavaScript analysis
3. **Logging**: All analysis results are logged to the database
4. **Error Handling**: Graceful degradation when C++ service is down

### Environment Variables

The backend uses these environment variables:

- `CPP_SERVICE_URL`: URL of the C++ service (default: `http://localhost:8000`)

## Docker Integration

The C++ service is containerized and can be run with Docker:

```bash
# Build the Docker image
docker build -t post-analyzer-cpp .

# Run the container
docker run -p 8000:8000 post-analyzer-cpp
```

## Performance

The C++ implementation provides significant performance improvements:

- **Speed**: 5-10x faster than JavaScript implementation
- **Memory**: More efficient memory usage
- **CPU**: Better CPU utilization for text processing

## Development

### Adding New Analysis Features

1. **Modify `analyzer.cpp`**: Add new analysis methods
2. **Update `rest_api.cpp`**: Add new API endpoints
3. **Rebuild**: Run `./build.sh` to rebuild the service
4. **Test**: Use the test script or curl to test new features

### Testing

```bash
# Test the service
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a test text for analysis."}'

# Health check
curl http://localhost:8000/health
```

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Ensure all dependencies are installed
   - Check CMake version (requires 3.10+)
   - Verify compiler supports C++17

2. **Service Won't Start**:
   - Check if port 8000 is available
   - Verify network permissions
   - Check firewall settings

3. **Integration Issues**:
   - Ensure C++ service is running before starting Node.js backend
   - Check `CPP_SERVICE_URL` environment variable
   - Verify network connectivity between services

### Logs

The service outputs logs to stdout. Check for:
- Service startup messages
- Request/response logs
- Error messages

## Contributing

When contributing to the C++ service:

1. **Follow C++17 standards**
2. **Add error handling** for all external calls
3. **Include performance optimizations** where appropriate
4. **Update documentation** for new features
5. **Test thoroughly** before submitting changes 