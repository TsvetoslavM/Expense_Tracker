# Using Python 3.13 with Expense Tracker Frontend

This guide explains how to test and verify the Expense Tracker frontend code using Python 3.13.

## Overview

The Expense Tracker application is built with:
- Backend: FastAPI (Python)
- Frontend: Next.js (React, TypeScript)

While the frontend is developed with JavaScript/TypeScript, we've created a set of Python tests that can verify the frontend structure, components, and connectivity without requiring Node.js.

## Prerequisites

- Python 3.13 installed and in your PATH
- The Expense Tracker repository cloned to your local machine

## Testing Without Backend (Static Analysis)

To run frontend static analysis tests without requiring the backend to be running:

### Windows

```powershell
# In PowerShell
$env:SKIP_BACKEND_TESTS="true"; .\run_python313.bat
```

### Linux/Mac

```bash
# In Bash
SKIP_BACKEND_TESTS=true ./run_python313.sh
```

## Testing With Backend Connectivity

To test frontend-backend connectivity (requires the backend to be running):

1. Start the backend server:
   ```bash
   cd backend
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. In another terminal, run the tests:

   ### Windows
   ```powershell
   # In PowerShell
   .\run_python313.bat
   ```

   ### Linux/Mac
   ```bash
   # In Bash
   ./run_python313.sh
   ```

### Automated Server Management for API Tests

For testing API endpoints specifically, we now provide an automated solution:

```bash
# Run API tests with automatic server management
python backend/tests/run_api_tests.py
```

This script:
- Checks if the backend server is already running
- Offers to start the server for you if it's not running
- Runs all API compatibility tests
- Provides clear feedback on test results

This simplifies the testing process by eliminating the need to manually start the server in a separate terminal.

For Windows users, we also provide a dedicated batch file:

```powershell
# In PowerShell
backend\tests\run_api_tests.bat
```

For Linux/Mac users, use the shell script:

```bash
# Make executable first
chmod +x backend/tests/run_api_tests.sh

# Run the script
./backend/tests/run_api_tests.sh
```

These scripts set up all necessary environment variables and run the API tests with server management, making it the easiest way to test API endpoints with Python 3.13.

## Test Categories

The frontend tests are organized into the following categories:

1. **Structure Tests**: Verify that the frontend project structure is correct
   - Checks for essential directories and files
   - Validates package.json and its dependencies
   - Confirms presence of key configuration files

2. **Component Tests**: Statically analyze component files
   - Verifies that components follow React best practices
   - Checks for proper export patterns
   - Validates UI component presence

3. **Page Tests**: Analyze specific page implementations
   - Examines the Categories page for proper structure and functionality
   - Verifies form validation schemas and component usage
   - Checks for responsive UI implementation

4. **Authentication Tests**: Verify authentication-related features
   - Tests login and registration page structure
   - Validates AuthContext implementation
   - Checks for protected route mechanisms
   - Verifies proper index page redirects

5. **Connectivity Tests**: Verify frontend-backend communication
   - Tests that the backend endpoints are accessible
   - Verifies that protected endpoints require authentication
   - Checks configuration of API client

6. **API Compatibility Tests**: Test actual backend API endpoints
   - Tests authentication endpoints directly
   - Verifies server health status
   - Tests user registration and login
   - Confirms JWT token generation

## Available Page Tests

### Categories Page Test

The Categories page test (`test_frontend_categories.py`) validates:
- Presence of key React hooks like useState, useForm
- Proper implementation of form validation with Zod schema
- CRUD operations for categories (create, read, update, delete)
- Responsive UI component implementation
- Conditional rendering based on application state

### Authentication Pages Test

The Authentication test (`test_frontend_auth.py`) validates:
- Structure and content of login and registration pages
- Implementation of the AuthContext provider
- Protected route implementation for secured pages
- Proper index page redirects based on authentication state
- Logout functionality and proper session cleanup

For more detailed information about authentication testing, see [Authentication Testing Documentation](AUTH_TESTING.md).

## Adding More Frontend Tests

### 1. Create a new test file in `backend/tests/`

Example:
```python
"""
Test frontend feature X.
"""

import os
import sys
import pytest
from pathlib import Path

# Add the parent directory to Python path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
    print(f"Added {parent_dir} to Python path")

# Get frontend directory
frontend_dir = os.path.join(os.path.dirname(parent_dir), "frontend")

def test_something():
    """Test something about the frontend."""
    # Your test code here
    assert True
```

### 2. Update the run scripts

Add your new test to both `run_python313.bat` and `run_python313.sh`.

## Troubleshooting

### "No module named 'pytest'"

Install the required dependencies:
```bash
python -m pip install pytest httpx sqlalchemy
```

### "ImportError: No module named tests.test_config"

This usually means the PYTHONPATH is not set correctly. The run scripts should handle this, but if you're running tests manually, make sure to set:

```bash
# Linux/Mac
export PYTHONPATH=path/to/backend:path/to/backend/tests

# Windows
set PYTHONPATH=path\to\backend;path\to\backend\tests
```

### "ConnectionRefusedError" in Connectivity Tests

If you're seeing connection errors when running the connectivity tests, make sure:
1. The backend server is running on port 8000
2. You haven't set SKIP_BACKEND_TESTS=true

## Benefits of Python Testing for Frontend

1. **Integrated Testing Environment**: Test both frontend and backend with the same tools
2. **No Node.js Dependency**: Run frontend structure tests without Node.js
3. **Simplified CI/CD**: Use a single language for testing in CI/CD pipelines
4. **Python 3.13 Compatibility**: Ensure the application works with the latest Python version 