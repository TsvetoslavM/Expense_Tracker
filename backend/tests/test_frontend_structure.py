"""
Test the frontend project structure.
This test ensures that key files and directories exist in the frontend project.
"""

import os
import sys
import json
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
print(f"Frontend directory: {frontend_dir}")


def test_frontend_directory_exists():
    """Test that the frontend directory exists."""
    assert os.path.exists(frontend_dir)
    assert os.path.isdir(frontend_dir)


def test_frontend_package_json():
    """Test that package.json exists and has the necessary scripts."""
    package_json_path = os.path.join(frontend_dir, "package.json")
    assert os.path.exists(package_json_path)
    
    try:
        with open(package_json_path, "r") as f:
            package_json = json.load(f)
        
        # Check key properties
        assert "name" in package_json
        assert "version" in package_json
        assert "scripts" in package_json
        
        # Check required scripts
        scripts = package_json["scripts"]
        assert "dev" in scripts
        assert "build" in scripts
        assert "start" in scripts
        
        # Check key dependencies
        dependencies = package_json.get("dependencies", {})
        dev_dependencies = package_json.get("devDependencies", {})
        all_dependencies = {**dependencies, **dev_dependencies}
        
        essential_deps = ["react", "next", "axios"]
        for dep in essential_deps:
            assert any(dep in key for key in all_dependencies.keys()), f"Missing essential dependency: {dep}"
            
        print(f"Package.json is valid: {package_json['name']} v{package_json['version']}")
        
    except json.JSONDecodeError:
        pytest.fail("package.json is not valid JSON")
    except Exception as e:
        pytest.fail(f"Error parsing package.json: {str(e)}")


def test_frontend_next_config():
    """Test that next.config.js exists."""
    next_config_path = os.path.join(frontend_dir, "next.config.js")
    assert os.path.exists(next_config_path)


@pytest.mark.parametrize(
    "path",
    [
        "pages",
        "pages/index.tsx",
        "pages/_app.tsx",
        "components",
        "styles",
        "styles/globals.css", 
        "public",
        "lib/api.ts"
    ]
)
def test_frontend_key_files(path):
    """Test that key frontend files and directories exist."""
    full_path = os.path.join(frontend_dir, path)
    assert os.path.exists(full_path), f"Missing key file or directory: {path}"
    print(f"Frontend path exists: {path}")


def test_frontend_api_client():
    """Test that the API client is properly configured."""
    api_ts_path = os.path.join(frontend_dir, "lib", "api.ts")
    assert os.path.exists(api_ts_path)
    
    try:
        with open(api_ts_path, "r") as f:
            api_ts_content = f.read()
        
        # Check for important API functions
        essential_functions = ["login", "register", "getAllCategories", "getAllExpenses"]
        for func in essential_functions:
            assert func in api_ts_content, f"API client is missing {func} function"
            
        # Check for NEXT_PUBLIC_API_URL
        assert "NEXT_PUBLIC_API_URL" in api_ts_content, "API client is not using NEXT_PUBLIC_API_URL"
        
        print("API client is properly configured")
        
    except Exception as e:
        pytest.fail(f"Error checking API client: {str(e)}")


def test_frontend_auth_context():
    """Test that the authentication context is properly set up."""
    auth_context_path = os.path.join(frontend_dir, "context", "AuthContext.tsx")
    assert os.path.exists(auth_context_path)
    
    try:
        with open(auth_context_path, "r") as f:
            auth_context_content = f.read()
        
        # Check for important auth functions
        essential_functions = ["login", "logout", "register", "isAuthenticated"]
        for func in essential_functions:
            assert func in auth_context_content, f"Auth context is missing {func} function"
            
        print("Auth context is properly set up")
        
    except Exception as e:
        pytest.fail(f"Error checking auth context: {str(e)}") 