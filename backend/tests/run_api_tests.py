"""
Run API tests with Python 3.13.

This script runs the API compatibility tests, optionally starting the backend server
if it's not already running. This allows for easy testing of the API endpoints.
"""

import os
import sys
import time
import socket
import subprocess
import importlib.util
from pathlib import Path

# Add the parent directory to Python path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
    print(f"Added {parent_dir} to Python path")

# Make test_api_compatibility available
try:
    import test_api_compatibility
except ImportError:
    print("Error: test_api_compatibility.py not found.")
    sys.exit(1)

def is_server_running():
    """Check if the backend server is running on port 8000."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(1)
            result = s.connect_ex(('localhost', 8000))
            return result == 0
    except:
        return False

def start_server_in_background():
    """Start the backend server in the background."""
    print("Starting the backend server in the background...")
    
    # Start the server as a subprocess with run_backend_server.py
    try:
        # Create a new process, then detach it so it keeps running independently
        if os.name == 'nt':  # Windows
            server_process = subprocess.Popen(
                [sys.executable, os.path.join(current_dir, "run_backend_server.py")],
                creationflags=subprocess.CREATE_NEW_CONSOLE
            )
        else:  # Linux/Mac
            server_process = subprocess.Popen(
                [sys.executable, os.path.join(current_dir, "run_backend_server.py")],
                start_new_session=True
            )
        
        print("Backend server started in a new window.")
        
        # Wait for the server to start
        print("Waiting for the server to start...", end="")
        for _ in range(30):  # Try for 30 seconds
            if is_server_running():
                print("\nServer is running!")
                return True
            time.sleep(1)
            print(".", end="", flush=True)
        
        print("\nTimed out waiting for the server to start.")
        return False
        
    except Exception as e:
        print(f"Error starting server: {e}")
        return False

def run_tests():
    """Run the API compatibility tests."""
    print("\nRunning API compatibility tests...\n")
    
    # Run all tests from test_api_compatibility.py
    test_api_compatibility.run_all_tests()

def main():
    """Main function to run API tests."""
    print("="*60)
    print("API TESTING WITH PYTHON 3.13")
    print("="*60)
    
    # Check if the server is already running
    server_was_started = False
    
    if not is_server_running():
        print("Backend server is not running.")
        choice = input("Do you want to start the server? (y/n): ").strip().lower()
        
        if choice == 'y':
            server_was_started = start_server_in_background()
            if not server_was_started:
                print("Could not start the server. Please start it manually.")
                sys.exit(1)
        else:
            print("Tests cannot run without the server. Exiting.")
            sys.exit(0)
    else:
        print("Backend server is already running.")
    
    # Run the tests
    run_tests()
    
    if server_was_started:
        print("\nNOTE: The server is still running in a separate window.")
        print("You can close it when you're done testing.")
    
    print("\n" + "="*60)
    print("API TESTING COMPLETED")
    print("="*60)

if __name__ == "__main__":
    main() 