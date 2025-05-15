#!/usr/bin/env python
import pytest
import os
import sys
import importlib.util
import subprocess
import tempfile

def check_requirements():
    """
    Check if required packages are installed.
    """
    required_packages = [
        "pytest",
        "fastapi",
        "httpx",         # Critical for TestClient
    ]
    
    optional_packages = [
        "pandas",
        "reportlab",
    ]
    
    # Always required packages
    missing_critical = []
    for package in required_packages:
        spec = importlib.util.find_spec(package)
        if spec is None:
            missing_critical.append(package)
    
    # Optional packages - tests may be skipped if these are missing
    missing_optional = []
    for package in optional_packages:
        spec = importlib.util.find_spec(package)
        if spec is None:
            missing_optional.append(package)
    
    if missing_critical:
        print("ERROR: The following required packages are missing:")
        for package in missing_critical:
            print(f"  - {package}")
        print("\nPlease install them using:")
        print("python install_requirements.py")
        print("or")
        print(f"pip install {' '.join(missing_critical)}")
        return False
    
    if missing_optional:
        print("WARNING: The following optional packages are missing:")
        for package in missing_optional:
            print(f"  - {package}")
        print("\nSome tests may be skipped. Install these packages for full test coverage.")
    
    return True

def check_pydantic_compatibility():
    """
    Check if Pydantic version is compatible with the tests.
    """
    try:
        import pydantic
        print(f"Pydantic version: {pydantic.__version__}")
        
        # Check if it's a V2 API
        if hasattr(pydantic, 'field_validator'):
            print("Using Pydantic v2 API")
            # Test a basic Pydantic model with V2 API
            from pydantic import BaseModel, field_validator
            
            class TestModel(BaseModel):
                name: str
                
                @field_validator('name')
                @classmethod
                def validate_name(cls, v):
                    return v
            
            TestModel(name="test")
        else:
            print("Using Pydantic v1 API")
            # Test with V1 API
            from pydantic import BaseModel, validator
            
            class TestModel(BaseModel):
                name: str
                
                @validator('name')
                def validate_name(cls, v):
                    return v
            
            TestModel(name="test")
            
            print("WARNING: Using Pydantic v1. Consider upgrading to Pydantic v2 for better compatibility.")
            
        return True
    except ImportError as e:
        print(f"ERROR: Pydantic compatibility check failed: {e}")
        print("Make sure you have pydantic and pydantic-settings installed.")
        return False
    except AttributeError as e:
        print(f"ERROR: Pydantic API compatibility issue: {e}")
        print("Your pydantic version might be incompatible with the tests.")
        print("Try installing pydantic==2.4.2 and pydantic-settings==2.0.3")
        return False
    except Exception as e:
        print(f"ERROR: Unexpected error during Pydantic compatibility check: {e}")
        return False

def check_database_access():
    """
    Check if SQLite database can be created and accessed.
    Returns:
        - 0: Success - Database created and operations succeed
        - 1: Connection error - Cannot create/connect to database 
        - 2: Query error - Connection works but operations fail
        - 3: Unexpected error occurred
    """
    try:
        import sqlite3
        
        # Create a temporary database file
        fd, path = tempfile.mkstemp(suffix='.db')
        os.close(fd)
        
        try:
            # Try to connect to the database
            try:
                conn = sqlite3.connect(path)
            except sqlite3.Error:
                print("ERROR: Failed to connect to SQLite database.")
                return 1
                
            try:
                # Test schema creation
                conn.execute("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)")
                
                # Test data insertion
                conn.execute("INSERT INTO test (name) VALUES (?)", ("test",))
                
                # Test data retrieval
                cursor = conn.execute("SELECT id, name FROM test")
                row = cursor.fetchone()
                if not row or row[1] != "test":
                    print("ERROR: Data verification failed in SQLite test.")
                    conn.close()
                    return 2
                    
                # Test transaction support
                conn.rollback()  # This should remove our inserted row
                cursor = conn.execute("SELECT COUNT(*) FROM test")
                count = cursor.fetchone()[0]
                if count > 0:
                    print("WARNING: Transaction rollback did not work as expected.")
                
                # Test successful commit
                conn.execute("INSERT INTO test (name) VALUES (?)", ("committed",))
                conn.commit()
                
                # Verify commit worked
                cursor = conn.execute("SELECT name FROM test WHERE name=?", ("committed",))
                row = cursor.fetchone()
                if not row or row[0] != "committed":
                    print("ERROR: Database commit operation failed.")
                    conn.close()
                    return 2
                
                conn.close()
                print("SUCCESS: Database connection and operations verified successfully.")
                return 0
            except sqlite3.Error as query_error:
                print(f"ERROR: Database query failed: {query_error}")
                conn.close()
                return 2
        finally:
            # Clean up the temporary file
            try:
                os.unlink(path)
            except Exception:
                pass
    except sqlite3.Error as e:
        print(f"ERROR: SQLite database access error: {e}")
        print("Make sure your Python installation supports SQLite.")
        return 1
    except Exception as e:
        print(f"ERROR: Unexpected error during database check: {e}")
        return 3

def run_tests():
    """
    Run the tests for report components.
    """
    # First check requirements
    if not check_requirements():
        return 1
    
    # Check Pydantic compatibility
    if not check_pydantic_compatibility():
        return 1
    
    # Check database access
    db_status = check_database_access()
    if db_status != 0:
        print(f"Database check failed with status code: {db_status}")
        if db_status == 1:
            print("ERROR: Cannot create or connect to the database. Please check your SQLite installation.")
        elif db_status == 2:
            print("ERROR: Database queries failed. The database connection works but operations are failing.")
        elif db_status == 3:
            print("ERROR: An unexpected error occurred during database tests.")
        return 1
    
    # Get the directory of this script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Add the project root to sys.path to ensure imports work correctly
    project_root = os.path.dirname(current_dir)
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
    
    print(f"Parent directory added to Python path: {project_root}")
    print(f"Full Python path: {sys.path}")
    
    # Specific test files related to reports
    test_files = [
        "test_report_generator.py",
        "test_reports.py",
        "test_financial_reports.py"
    ]
    
    # Build the test file paths
    test_paths = [os.path.join(current_dir, file) for file in test_files]
    
    print("Running tests for report components...")
    
    # Set environment variables for testing
    os.environ["APP_NAME"] = "Expense Tracker Test"
    os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only"
    os.environ["DATABASE_URL"] = "sqlite:///./test.db"
    os.environ["FRONTEND_URL"] = "http://localhost:3000"
    
    # Additional environment variables for database connection
    os.environ["POSTGRES_USER"] = "test_user"
    os.environ["POSTGRES_PASSWORD"] = "test_password"
    os.environ["POSTGRES_DB"] = "test_db"
    os.environ["POSTGRES_HOST"] = "localhost"
    
    # Run the tests with pytest
    # Add the -k flag to skip tests requiring pandas if pandas is not installed
    pytest_args = ['-v']
    
    # Check if pandas is available
    pandas_available = importlib.util.find_spec("pandas") is not None
    if not pandas_available:
        print("WARNING: pandas is not available. Tests requiring pandas will be skipped.")
        pytest_args.append("-k 'not pandas and not report_generation'")
    
    return_code = pytest.main(pytest_args + test_paths)
    
    return return_code

if __name__ == "__main__":
    sys.exit(run_tests()) 