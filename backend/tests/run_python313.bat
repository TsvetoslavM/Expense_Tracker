@echo off
echo Expense Tracker - Running Tests with Python 3.13
echo ================================================
echo.
echo This script is designed to run tests with Python 3.13,
echo skipping tests that require packages with compatibility issues.
echo.

REM Check if Python 3.13 is available
python --version 2>NUL
if %ERRORLEVEL% NEQ 0 (
    echo Python not found. Please ensure Python is installed and in your PATH.
    goto :end
)

REM Check the Python version
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYVER=%%i
echo Detected Python version: %PYVER%

REM Get the current directory and parent directory
set CURRENT_DIR=%~dp0
set PARENT_DIR=%CURRENT_DIR:~0,-7%
set ROOT_DIR=%PARENT_DIR:~0,-8%
echo Current directory: %CURRENT_DIR%
echo Parent directory: %PARENT_DIR%
echo Root directory: %ROOT_DIR%

REM Change to the tests directory to ensure tests can find each other
cd %CURRENT_DIR%
echo Changed current directory to: %CD%

REM Set environment variables for testing
set APP_NAME=Expense Tracker Test
set SECRET_KEY=test-secret-key-for-testing-only
set DATABASE_URL=sqlite:///./test.db
set FRONTEND_URL=http://localhost:3000
set NEXT_PUBLIC_API_URL=http://localhost:8000
set POSTGRES_USER=test_user
set POSTGRES_PASSWORD=test_password
set POSTGRES_DB=test_db
set POSTGRES_HOST=localhost

REM Add the parent directory to PYTHONPATH - both the backend and the tests directory
set PYTHONPATH=%PARENT_DIR%;%CURRENT_DIR%;%PYTHONPATH%
echo PYTHONPATH set to: %PYTHONPATH%

echo.
echo Basic dependency check...
python -c "import pytest" 2>NUL
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Installing minimal dependencies...
    python -m pip install pytest httpx sqlalchemy
)

echo.
echo Running simple test to verify Python path and imports...
python -m pytest -v test_simple.py

echo.
echo Running simplified report generator tests...
python -m pytest -v py313_test_report_generator.py

echo.
echo Running frontend structure tests...
python -m pytest -v test_frontend_structure.py

echo.
echo Running frontend component tests...
python -m pytest -v test_frontend_components.py

echo.
echo Running frontend categories page tests...
python -m pytest -v test_frontend_categories.py

echo.
echo Running frontend authentication tests...
python -m pytest -v test_frontend_auth.py

REM Check if we should run backend connectivity tests
IF NOT DEFINED SKIP_BACKEND_TESTS (
    echo.
    echo Running frontend-backend connectivity tests...
    echo (Set SKIP_BACKEND_TESTS=true to skip these tests if the backend is not running)
    python -m pytest -v test_frontend_connectivity.py
    
    echo.
    echo Running API compatibility tests...
    echo (These tests require the backend server to be running)
    python run_api_tests.py
) ELSE (
    echo.
    echo Skipping frontend-backend connectivity tests (SKIP_BACKEND_TESTS is set)
)

echo.
echo All tests completed!

:end
echo.
echo Test run complete.
pause 