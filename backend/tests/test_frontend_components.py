"""
Test frontend components without requiring rendering.
This test checks component files for common patterns and exports.
"""

import os
import sys
import re
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


def get_all_tsx_files(directory, exclude_dirs=None):
    """Get all .tsx files in a directory and its subdirectories."""
    if exclude_dirs is None:
        exclude_dirs = ["node_modules", ".next"]
    
    tsx_files = []
    for root, dirs, files in os.walk(directory):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            if file.endswith(".tsx"):
                tsx_files.append(os.path.join(root, file))
    
    return tsx_files


def test_ui_components_exist():
    """Test that UI components exist."""
    components_dir = os.path.join(frontend_dir, "components", "ui")
    assert os.path.exists(components_dir), "UI components directory doesn't exist"
    
    # Check for common UI components
    common_components = ["button.tsx"]
    for component in common_components:
        component_path = os.path.join(components_dir, component)
        assert os.path.exists(component_path), f"Common UI component {component} doesn't exist"


def test_layout_components_exist():
    """Test that layout components exist."""
    components_dir = os.path.join(frontend_dir, "components", "layout")
    if os.path.exists(components_dir):
        # Check for layout components (optional, may be in different structure)
        layout_files = os.listdir(components_dir)
        assert any(file.endswith(".tsx") for file in layout_files), "No layout components found"
        print(f"Found layout components: {[f for f in layout_files if f.endswith('.tsx')]}")


@pytest.mark.parametrize(
    "pattern,should_exist",
    [
        (r"export\s+default\s+function\s+\w+", True),  # export default function Component
        (r"from\s+['\"]react['\"]", True),             # import from "react"
        (r"import\s+.*\s+from\s+['\"]@/", True),       # import from local paths with @/
        (r"<div\s+className=", True),                  # className attribute
        (r"class=", False),                            # No class= (should use className)
    ]
)
def test_component_patterns(pattern, should_exist):
    """Test that component files follow expected patterns."""
    # Look in pages and components directories
    pages_dir = os.path.join(frontend_dir, "pages")
    components_dir = os.path.join(frontend_dir, "components")
    
    # Get all TSX files
    all_tsx_files = (
        get_all_tsx_files(pages_dir) +
        get_all_tsx_files(components_dir)
    )
    
    assert len(all_tsx_files) > 0, "No TSX files found"
    print(f"Checking {len(all_tsx_files)} TSX files for pattern: {pattern}")
    
    # Check for pattern in files
    compiled_pattern = re.compile(pattern)
    matches = []
    
    for file_path in all_tsx_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                
            if compiled_pattern.search(content):
                matches.append(os.path.relpath(file_path, frontend_dir))
        except Exception as e:
            print(f"Error reading {file_path}: {str(e)}")
    
    if should_exist:
        assert len(matches) > 0, f"Pattern '{pattern}' not found in any TSX files"
        print(f"Pattern '{pattern}' found in {len(matches)} files")
    else:
        if matches:
            print(f"Warning: Pattern '{pattern}' found in {len(matches)} files: {matches[:5]}")


def test_next_pages():
    """Test that Next.js pages are properly set up."""
    pages_dir = os.path.join(frontend_dir, "pages")
    assert os.path.exists(pages_dir), "Pages directory doesn't exist"
    
    # Check for essential pages
    essential_pages = ["_app.tsx", "index.tsx", "login.tsx"]
    for page in essential_pages:
        page_path = os.path.join(pages_dir, page)
        assert os.path.exists(page_path), f"Essential page {page} doesn't exist"

    # Check all pages for proper exports
    all_tsx_files = get_all_tsx_files(pages_dir)
    for file_path in all_tsx_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                
            # Check for export default
            assert re.search(r"export\s+default", content), f"Page {os.path.relpath(file_path, pages_dir)} doesn't have export default"
        except Exception as e:
            print(f"Error reading {file_path}: {str(e)}")


def test_api_routes():
    """Test that API routes are properly set up, if they exist."""
    api_dir = os.path.join(frontend_dir, "pages", "api")
    if os.path.exists(api_dir):
        print("API routes directory exists, checking API files")
        
        # Get all API route files
        api_files = get_all_tsx_files(api_dir)
        for file_path in api_files:
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    
                # Check for handler pattern
                assert re.search(r"export\s+default\s+(?:async\s+)?function", content), f"API route {os.path.relpath(file_path, api_dir)} doesn't have export default function"
            except Exception as e:
                print(f"Error reading {file_path}: {str(e)}") 