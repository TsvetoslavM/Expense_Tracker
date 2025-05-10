"""
Configuration for testing the Expense Tracker application.

This module provides test configuration utilities, including environment setup
and mocking helpers for database connections.
"""

import sys
import os
from pathlib import Path
from unittest.mock import patch
import importlib

# Determine the backend root directory
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)

# Make sure the backend directory is in Python path
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
    print(f"Added {backend_dir} to Python path in test_config.py")

# Patch environment variables before importing app modules
os.environ["APP_NAME"] = "Expense Tracker Test"
os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only"
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["FRONTEND_URL"] = "http://localhost:3000"

# Import modules that might depend on environment variables
from app.core.config import TestSettings

def get_test_settings():
    """
    Returns a TestSettings instance for testing.
    
    This provides a consistent set of settings for all tests.
    """
    return TestSettings()

def setup_test_environment():
    """
    Sets up a test environment with mocked settings.
    
    Returns a context manager that patches the settings to use TestSettings.
    
    Example:
        with setup_test_environment():
            # Code that will use test settings
            from app.main import app
    """
    # Set additional test environment variables
    os.environ["POSTGRES_USER"] = "test_user"
    os.environ["POSTGRES_PASSWORD"] = "test_password"
    os.environ["POSTGRES_DB"] = "test_db"
    os.environ["POSTGRES_HOST"] = "localhost"
    
    # Patch all places where settings might be imported
    patches = [
        patch('app.core.config.settings', get_test_settings()),
        patch('app.core.database.settings', get_test_settings())
    ]
    
    # Try to find and patch all modules that import settings
    try:
        # Reload the app.core.database module to use the test settings
        import app.core.database
        importlib.reload(app.core.database)
        
        # Force SQLite for tests regardless of environment
        app.core.database.engine = app.core.database.create_engine(
            "sqlite:///./test.db", connect_args={"check_same_thread": False}
        )
        
        # Recreate session maker to use SQLite
        app.core.database.SessionLocal = app.core.database.sessionmaker(
            autocommit=False, autoflush=False, bind=app.core.database.engine
        )
        
        print("Test database engine configured to use SQLite")
    except Exception as e:
        print(f"Warning: Could not reconfigure database engine: {e}")
    
    # Return a multi-context manager for all patches
    class MultiPatch:
        def __enter__(self):
            return [p.__enter__() for p in patches]
        
        def __exit__(self, *args, **kwargs):
            for p in reversed(patches):
                p.__exit__(*args, **kwargs)
    
    return MultiPatch() 