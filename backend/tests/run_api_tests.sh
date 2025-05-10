#!/bin/bash

echo "Expense Tracker - API Tests with Python 3.13"
echo "==============================================="
echo ""
echo "This script runs API compatibility tests with Python 3.13"
echo ""

# Check if Python 3.13 is available
python3 --version > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Python not found. Please ensure Python is installed and in your PATH."
    exit 1
fi

# Check the Python version
PYVER=$(python3 --version 2>&1 | awk '{print $2}')
echo "Detected Python version: $PYVER"

# Get the current directory and parent directory
CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PARENT_DIR="$(dirname "$CURRENT_DIR")"
echo "Current directory: $CURRENT_DIR"
echo "Parent directory: $PARENT_DIR"

# Change to the tests directory to ensure tests can find each other
cd "$CURRENT_DIR"
echo "Changed current directory to: $(pwd)"

# Set environment variables for testing
export APP_NAME="Expense Tracker Test"
export SECRET_KEY="test-secret-key-for-testing-only"
export DATABASE_URL="sqlite:///./test.db"
export FRONTEND_URL="http://localhost:3000"
export NEXT_PUBLIC_API_URL="http://localhost:8000"
export POSTGRES_USER="test_user"
export POSTGRES_PASSWORD="test_password"
export POSTGRES_DB="test_db"
export POSTGRES_HOST="localhost"

# Add the parent directory to PYTHONPATH - both the backend and the tests directory
export PYTHONPATH="$PARENT_DIR:$CURRENT_DIR:$PYTHONPATH"
echo "PYTHONPATH set to: $PYTHONPATH"

echo ""
echo "Running API compatibility tests with automatic server management..."
python3 run_api_tests.py

echo ""
echo "Test run complete." 