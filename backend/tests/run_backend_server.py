"""
Start the backend server for Expense Tracker.

This script handles starting the backend server with the proper settings
for API testing. It checks for required dependencies and installs them
if necessary.
"""

import os
import sys
import importlib
import subprocess
import traceback
from pathlib import Path

# Add the parent directory to Python path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
    print(f"Added {parent_dir} to Python path")

# Add the tests directory to Python path for importing simple_app
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
    print(f"Added {current_dir} to Python path")

def check_dependencies():
    """Check and install required dependencies."""
    required_packages = ["uvicorn", "fastapi", "pyjwt"]
    missing_packages = []
    
    for package in required_packages:
        try:
            importlib.import_module(package)
            print(f"✓ {package} is installed")
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"Installing missing packages: {', '.join(missing_packages)}")
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", *missing_packages
        ])
        print("All required packages are now installed")
    else:
        print("All required packages are already installed")

def setup_environment():
    """Set up the environment variables needed for the server."""
    # Set essential variables for testing
    os.environ.setdefault("APP_NAME", "Expense Tracker")
    os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only")
    os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
    os.environ.setdefault("FRONTEND_URL", "http://localhost:3000")
    os.environ.setdefault("POSTGRES_USER", "postgres")
    os.environ.setdefault("POSTGRES_PASSWORD", "postgres")
    os.environ.setdefault("POSTGRES_DB", "expense_tracker")
    os.environ.setdefault("POSTGRES_HOST", "localhost")
    
    print("Environment variables set for testing")

def start_server():
    """Start the backend server using uvicorn."""
    try:
        import uvicorn
        
        print("\n" + "="*60)
        print("STARTING EXPENSE TRACKER BACKEND SERVER")
        print("="*60)
        print("\nServer will be accessible at http://localhost:8000")
        print("API documentation: http://localhost:8000/docs")
        print("\nPress CTRL+C to stop the server")
        print("="*60 + "\n")
        
        # Try importing the app to detect any issues
        app_module = "app.main:app"
        print("Testing app import...")
        try:
            from app.main import app
            print("✓ Successfully imported the main app module")
        except Exception as e:
            print(f"❌ Error importing main app module: {e}")
            print("\nFalling back to simplified app for compatibility...")
            
            try:
                from simple_app import app
                print("✓ Successfully imported simplified app")
                app_module = "simple_app:app"
            except Exception as e:
                print(f"❌ Error importing simplified app: {e}")
                print("\nDetailed traceback:")
                traceback.print_exc()
                sys.exit(1)
        
        # Start the server with the appropriate app module
        print(f"\nStarting server with module: {app_module}")
        uvicorn.run(
            app_module,
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info",
        )
    except ImportError:
        print("Error: uvicorn not found. Make sure to install it with:")
        print("pip install uvicorn")
        sys.exit(1)
    except Exception as e:
        print(f"Error starting server: {e}")
        print("\nDetailed traceback:")
        traceback.print_exc()
        sys.exit(1)

def main():
    """Main function to run the server."""
    try:
        # Set working directory to backend folder
        os.chdir(parent_dir)
        print(f"Working directory set to: {os.getcwd()}")
        
        check_dependencies()
        setup_environment()
        start_server()
    except Exception as e:
        print(f"Unexpected error: {e}")
        print("\nDetailed traceback:")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main() 