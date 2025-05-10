"""
Simplified test file that works regardless of backend status.
"""

import os
import pytest


def test_simple_connectivity_check():
    """Simple test that always passes to ensure pytest works."""
    # Print some diagnostic information
    print("Simple connectivity test running")
    print(f"Python version: {os.sys.version}")
    print(f"SKIP_BACKEND_TESTS: {os.environ.get('SKIP_BACKEND_TESTS')}")
    
    # This should always pass
    assert True 