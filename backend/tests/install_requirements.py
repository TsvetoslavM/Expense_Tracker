#!/usr/bin/env python
import subprocess
import sys
import os
from pathlib import Path

def install_requirements():
    """
    Install all required packages for running the tests.
    """
    print("Installing required packages for testing...")
    
    # Updated package versions compatible with Python 3.13
    requirements = [
        "pytest==8.3.3",
        "pytest-cov==5.0.0",
        "fastapi==0.104.1",
        "sqlalchemy==2.0.23",
        "reportlab==4.0.7",
        # Lower pandas version with better Python 3.13 compatibility
        "numpy==1.26.4", # Install numpy separately first
        "pandas==2.0.3", # Use a version that's more compatible with Python 3.13
        "httpx==0.25.1",       # Required for FastAPI TestClient
        "pyjwt==2.10.0",       # For working with JWT tokens
        "python-multipart==0.0.6", # For form data
        "uvicorn==0.23.2",     # ASGI server
        "python-dotenv==1.0.0", # For environment variables
        "pydantic==2.4.2",     # Make sure we have the right version
        "pydantic-settings==2.0.3", # Settings module for pydantic
        "email-validator==2.1.0", # For email validation
    ]
    
    try:
        # Get the directory of this script
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Add the project root to sys.path to ensure imports work correctly
        project_root = os.path.dirname(current_dir)
        if project_root not in sys.path:
            sys.path.insert(0, project_root)
            print(f"Added {project_root} to Python path")
        
        # Check Python version
        py_version = sys.version_info
        print(f"Python version: {py_version.major}.{py_version.minor}.{py_version.micro}")
        
        # Add specific warning for Python 3.13
        if py_version.major == 3 and py_version.minor >= 13:
            print("WARNING: Python 3.13 is very recent and may have compatibility issues with some packages.")
            print("Consider using Python 3.11 or 3.12 for better compatibility.")
        
        # Check if running in a virtual environment
        in_venv = sys.prefix != sys.base_prefix
        if not in_venv:
            print("WARNING: You are not running in a virtual environment. It's recommended to use a virtual environment.")
            response = input("Continue anyway? (y/n): ")
            if response.lower() != 'y':
                print("Installation aborted.")
                return 1
        
        # Try to install numpy first separately (this often helps)
        print("Installing numpy first...")
        numpy_installed = False
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "numpy==1.26.4"])
            numpy_installed = True
            print("NumPy installed successfully.")
        except subprocess.CalledProcessError as e:
            print(f"Warning: Could not install NumPy: {e}")
            print("Will try to continue with other packages.")
        
        # Remove numpy from requirements if already installed
        if numpy_installed:
            requirements = [r for r in requirements if not r.startswith("numpy")]
        
        # Install remaining packages one by one to better track issues
        success_count = 0
        for package in requirements:
            try:
                print(f"Installing {package}...")
                subprocess.check_call([sys.executable, "-m", "pip", "install", package])
                success_count += 1
            except subprocess.CalledProcessError as e:
                print(f"Warning: Failed to install {package}: {e}")
                # Continue with other packages
        
        print(f"Successfully installed {success_count} out of {len(requirements)} packages.")
        
        # Create a requirements.txt file for future reference
        req_file = os.path.join(current_dir, "test_requirements.txt")
        with open(req_file, "w") as f:
            f.write("\n".join(requirements))
        print(f"Created {req_file} for future reference.")
        
        # If pandas or numpy failed, provide alternative approach
        if success_count < len(requirements):
            print("\nSome packages failed to install. For testing without pandas:")
            print("1. You can modify run_tests.py to skip tests requiring pandas")
            print("2. Or use a lower Python version (3.11 or 3.12) for better compatibility")
        
    except Exception as e:
        print(f"Unexpected error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(install_requirements()) 