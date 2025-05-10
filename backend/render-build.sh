#!/usr/bin/env bash
# render-build.sh - Script for Render build phase

echo "=== Starting Render Build Script ==="

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Setup SQLite as our database (based on environment)
if [ "$USE_SQLITE" = "true" ]; then
  echo "Using SQLite as database (SQLite flag is set to true)."
  export USE_SQLITE=true
  export DATABASE_URL="sqlite:///./expense_tracker.db"
else
  echo "SQLite flag is not set to true, checking for PostgreSQL URL..."
  if [ -z "$DATABASE_URL" ]; then
    echo "WARNING: DATABASE_URL is not set. Falling back to SQLite."
    export USE_SQLITE=true
    export DATABASE_URL="sqlite:///./expense_tracker.db"
  else
    echo "PostgreSQL connection string found, but using SQLite as specified in config."
    export USE_SQLITE=true
    export DATABASE_URL="sqlite:///./expense_tracker.db"
  fi
fi

echo "Database configuration:"
echo "  USE_SQLITE=$USE_SQLITE"
echo "  DATABASE_URL=$DATABASE_URL (credential part masked)"

echo "=== Render Build Script Complete ===" 