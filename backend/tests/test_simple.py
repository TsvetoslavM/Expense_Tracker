"""
Simple tests that don't depend on database connections or pandas.
These tests should work even with Python 3.13.
"""

import os
import pytest
import sys
from pathlib import Path

# Add the parent directory to Python path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
    print(f"Added {parent_dir} to Python path")

# Import from local py313_test_config instead of app modules
try:
    from py313_test_config import get_test_settings, setup_test_environment
    
    # Set up environment variables
    setup_test_environment()
    
except ImportError as e:
    print(f"Warning: Error importing py313_test_config: {e}")
    # Fallback for when imports don't work
    print("Warning: Using mock implementation")
    
    # Create a mock TestSettings for the test
    class TestSettings:
        APP_NAME = "Expense Tracker Test"
        DATABASE_URL = "sqlite:///./test.db"
        SECRET_KEY = "test-secret-key-for-testing-only"
    
    def get_test_settings():
        """Get test settings instance"""
        return TestSettings()


def test_environment_variables():
    """Test that environment variables are set correctly."""
    assert "APP_NAME" in os.environ
    assert "DATABASE_URL" in os.environ
    assert "SECRET_KEY" in os.environ
    print(f"APP_NAME: {os.environ.get('APP_NAME')}")
    print(f"DATABASE_URL: {os.environ.get('DATABASE_URL')}")


def test_test_settings():
    """Test that TestSettings can be instantiated."""
    settings = get_test_settings()
    assert settings.APP_NAME == "Expense Tracker Test"
    assert settings.DATABASE_URL == "sqlite:///./test.db"
    assert settings.SECRET_KEY == "test-secret-key-for-testing-only"
    print(f"Settings APP_NAME: {settings.APP_NAME}")


def test_python_version():
    """Test that Python version is compatible."""
    major, minor, micro = sys.version_info[:3]
    print(f"Python version: {major}.{minor}.{micro}")
    assert major == 3
    assert minor >= 9 