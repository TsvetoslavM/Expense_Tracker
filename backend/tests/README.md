# Testing the Report Components

This directory contains the test files for the report generation components of the Expense Tracker application.

## Test Files

- `test_report_generator.py`: Tests for the report_generator.py service
- `test_reports.py`: Tests for the reports.py router endpoints
- `test_financial_reports.py`: Tests for the financial_reports.py router endpoints
- `run_tests.py`: Script to run all the report-related tests

## Prerequisites

Before running the tests, make sure you have the required dependencies installed:

```bash
# Option 1: Install all dependencies
python install_requirements.py

# Option 2: Install minimal dependencies
pip install pytest fastapi httpx
```

### Python Version Compatibility

These tests are designed to work with Python 3.9 through 3.12. If you're using **Python 3.13**, you may encounter compatibility issues with the following packages:

- **pandas** (because of numpy dependencies)
- **reportlab** (may have dependencies on numpy)

In Python 3.13, some tests that require these packages will be automatically skipped, but core functionality tests will still run.

**Recommended Python version**: 3.11 or 3.12 for full test coverage.

## Running the Tests

### Option 1: Using the run_tests.py script (Recommended)

Our updated script will automatically:
- Check for required dependencies
- Skip tests requiring unavailable packages
- Set up the test environment correctly

```bash
python run_tests.py
```

### Option 2: Using pytest directly

You can also run the tests directly using pytest:

```bash
# Run all report tests
pytest test_report_generator.py test_reports.py test_financial_reports.py -v

# Run a specific test file
pytest test_report_generator.py -v

# Run a specific test function
pytest test_reports.py::test_generate_expenses_csv -v

# Skip tests that require pandas
pytest -k "not pandas and not report_generation" test_report_generator.py test_reports.py test_financial_reports.py -v
```

### Run with Coverage

To run the tests with coverage:

```bash
pytest --cov=app.services.report_generator --cov=app.routers.reports --cov=app.routers.financial_reports test_report_generator.py test_reports.py test_financial_reports.py
```

## Test Database

The tests for `reports.py` use a SQLite database for testing. This database is created in memory and populated with test data before each test, and cleaned up afterward.

The tests for `report_generator.py` don't require a database as they test standalone functions.

The tests for `financial_reports.py` use mocks to isolate the router from its dependencies.

## Mocked Dependencies

In some test files, dependencies like authentication and database access are mocked to isolate the component being tested. This approach ensures that tests are fast and don't depend on external resources.

## Troubleshooting

### Python 3.13 Specific Issues

If using Python 3.13:
1. The `install_requirements.py` script will install packages one by one to maximize successful installations
2. Some packages like pandas might fail to install due to numpy compatibility issues
3. Tests requiring these packages will be automatically skipped

### Common Issues

- **Missing modules**: Ensure you've installed required dependencies
- **SQLite errors**: Ensure your Python installation includes SQLite support
- **Pydantic errors**: Make sure you have compatible versions of pydantic (2.4.2) and pydantic-settings (2.0.3)
- **PostgresDSN errors**: The updated code handles different versions of Pydantic's URL-building API 