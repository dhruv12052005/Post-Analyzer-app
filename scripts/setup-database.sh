#!/bin/bash

# Database setup script for Post Analyzer Application

set -e

echo "Setting up MySQL database for Post Analyzer..."

# Database configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD:-password}
DB_NAME=${DB_NAME:-post_analyzer}

# Check if MySQL client is available
if ! command -v mysql &> /dev/null; then
    echo "Error: MySQL client is not installed. Please install mysql-client."
    exit 1
fi

# Function to run MySQL command
run_mysql() {
    if [ -z "$DB_PASSWORD" ]; then
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$@"
    else
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$@"
    fi
}

# Test database connection
echo "Testing database connection..."
if ! run_mysql -e "SELECT 1;" &> /dev/null; then
    echo "Error: Cannot connect to MySQL database."
    echo "Please check your database configuration:"
    echo "  DB_HOST: $DB_HOST"
    echo "  DB_PORT: $DB_PORT"
    echo "  DB_USER: $DB_USER"
    echo "  DB_PASSWORD: $DB_PASSWORD"
    exit 1
fi

echo "Database connection successful!"

# Create database if it doesn't exist
echo "Creating database '$DB_NAME' if it doesn't exist..."
run_mysql -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migration
echo "Running database migration..."
run_mysql "$DB_NAME" < database/migrations/001_initial_schema.sql

echo "Database setup completed successfully!"
echo "Database '$DB_NAME' is ready for use."

# Display connection info
echo ""
echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""
echo "You can now start the application with:"
echo "  npm run dev    # For development"
echo "  docker-compose up    # For Docker deployment" 