#!/bin/bash

echo "Expense Tracker - Running Tests with Python 3.13"
echo "================================================"
echo

echo "This script is designed to run tests with Python 3.13,"
echo "skipping tests that require packages with compatibility issues."
echo

# Check if Python 3.13 is available
if ! command -v python &> /dev/null; then
    echo "Python not found. Please ensure Python is installed and in your PATH."
    exit 1
fi

# Check the Python version
PYVER=$(python --version 2>&1 | cut -d' ' -f2)
echo "Detected Python version: $PYVER"

# Get directories
CURRENT_DIR=$(dirname "$(realpath "$0")")
PARENT_DIR=$(dirname "$CURRENT_DIR")
ROOT_DIR=$(dirname "$PARENT_DIR")
echo "Current directory: $CURRENT_DIR"
echo "Parent directory: $PARENT_DIR"
echo "Root directory: $ROOT_DIR"

# Change to the tests directory
cd "$CURRENT_DIR" || exit 1
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

# Add the parent directory to PYTHONPATH
export PYTHONPATH="$PARENT_DIR:$CURRENT_DIR:$PYTHONPATH"
echo "PYTHONPATH set to: $PYTHONPATH"

echo
echo "Basic dependency check..."
if ! python -c "import pytest" &> /dev/null; then
    echo
    echo "Installing minimal dependencies..."
    python -m pip install pytest httpx sqlalchemy
fi

echo
echo "Running simple test to verify Python path and imports..."
python -m pytest -v test_simple.py

echo
echo "Running simplified report generator tests..."
python -m pytest -v py313_test_report_generator.py

echo
echo "Running frontend structure tests..."
python -m pytest -v test_frontend_structure.py

echo
echo "Running frontend component tests..."
python -m pytest -v test_frontend_components.py

# Check if we should run backend connectivity tests
if [ -z "$SKIP_BACKEND_TESTS" ]; then
    echo
    echo "Running frontend-backend connectivity tests..."
    echo "(Set SKIP_BACKEND_TESTS=true to skip these tests if the backend is not running)"
    python -m pytest -v test_frontend_connectivity.py
else
    echo
    echo "Skipping frontend-backend connectivity tests (SKIP_BACKEND_TESTS is set)"
fi

echo
echo "All tests completed!"

echo
echo "Test run complete." 