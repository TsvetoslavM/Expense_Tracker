@echo off
echo === Expense Tracker Report Tests ===
echo.

REM Check if Python is available
where python > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Python not found! Please make sure Python is installed and in your PATH.
    exit /b 1
)

REM Install requirements if needed
echo Checking for required packages...
python -c "import httpx" > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Some required packages are missing. Installing them now...
    python install_requirements.py
    if %ERRORLEVEL% neq 0 (
        echo Failed to install required packages.
        exit /b 1
    )
)

REM Run the tests
echo.
echo Running report tests...
python run_tests.py

if %ERRORLEVEL% neq 0 (
    echo.
    echo Some tests failed. See above for details.
) else (
    echo.
    echo All tests passed successfully!
)

echo.
echo === Test run complete === 