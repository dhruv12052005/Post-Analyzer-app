cmake_minimum_required(VERSION 3.10)
project(PostAnalyzer)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# WebAssembly build configuration
if(EMSCRIPTEN)
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s WASM=1 -s EXPORTED_FUNCTIONS='[\"_createAnalyzer\", \"_destroyAnalyzer\", \"_analyzeText\"]' -s EXPORTED_RUNTIME_METHODS='[\"ccall\", \"cwrap\"]'")
    set(CMAKE_EXECUTABLE_SUFFIX ".js")
endif()

# Add source files
set(SOURCES
    analyzer.cpp
)

# Create library
add_library(post_analyzer STATIC ${SOURCES})

# Set include directories
target_include_directories(post_analyzer PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})

# For WebAssembly, create a simple test executable
if(EMSCRIPTEN)
    add_executable(analyzer_test test.cpp)
    target_link_libraries(analyzer_test post_analyzer)
endif()

# For native builds, create a test executable
if(NOT EMSCRIPTEN)
    add_executable(analyzer_test test.cpp)
    target_link_libraries(analyzer_test post_analyzer)
endif() 