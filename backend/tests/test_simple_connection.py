"""
Basic test file to verify pytest works.
"""

import os
import pytest


def test_simple_check():
    """Simple test that always passes."""
    # Print some diagnostic information
    print("Simple test running")
    print(f"Python version: {os.sys.version}")
    
    # This should always pass
    assert True 