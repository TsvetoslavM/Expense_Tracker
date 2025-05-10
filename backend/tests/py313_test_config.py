"""
Simplified configuration for Python 3.13 tests.

This module provides minimal test configuration for Python 3.13 compatibility,
avoiding complex imports or dependencies.
"""

import os
import sys
from pathlib import Path

# TestSettings class that doesn't rely on Pydantic
class TestSettings:
    """
    Simplified TestSettings class for Python 3.13 tests.
    This class provides basic settings without Pydantic dependencies.
    """
    APP_NAME = "Expense Tracker Test"
    API_V1_STR = "/api"
    SECRET_KEY = "test-secret-key-for-testing-only"
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    DATABASE_URL = "sqlite:///./test.db"
    POSTGRES_USER = "test_user"
    POSTGRES_PASSWORD = "test_password"
    POSTGRES_DB = "test_db"
    POSTGRES_HOST = "localhost"
    POSTGRES_PORT = "5432"
    FRONTEND_URL = "http://localhost:3000"
    BACKEND_CORS_ORIGINS = ["http://localhost:3000", "http://localhost:8000"]
    
    # Add a dictionary-like access method for compatibility
    def __getitem__(self, key):
        return getattr(self, key)
        
    # Add a get method for compatibility
    def get(self, key, default=None):
        return getattr(self, key, default)


def get_test_settings():
    """
    Returns a TestSettings instance for testing.
    """
    return TestSettings()


def setup_test_environment():
    """
    Sets up environment variables for testing.
    """
    # Set test environment variables
    os.environ["APP_NAME"] = "Expense Tracker Test"
    os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only"
    os.environ["DATABASE_URL"] = "sqlite:///./test.db"
    os.environ["FRONTEND_URL"] = "http://localhost:3000"
    os.environ["POSTGRES_USER"] = "test_user"
    os.environ["POSTGRES_PASSWORD"] = "test_password"
    os.environ["POSTGRES_DB"] = "test_db"
    os.environ["POSTGRES_HOST"] = "localhost"
    
    # Set up Python path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(current_dir)
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)
        print(f"Added {backend_dir} to Python path")
        
    return get_test_settings()


# Create default test settings instance
test_settings = get_test_settings() 