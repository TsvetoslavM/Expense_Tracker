"""
Test frontend Categories page structure and patterns.
This test file analyzes the Categories page in the frontend to verify its structure and patterns.
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
root_dir = os.path.dirname(parent_dir)
frontend_dir = os.path.join(root_dir, "frontend")
categories_page_path = os.path.join(frontend_dir, "pages", "categories", "index.tsx")


def test_categories_page_exists():
    """Test that the Categories page exists."""
    assert os.path.exists(categories_page_path), f"Categories page not found at {categories_page_path}"


def test_categories_page_content():
    """Test that the Categories page contains expected elements."""
    with open(categories_page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check for key imports
    assert re.search(r"import\s+{\s*useState", content), "useState import missing"
    assert re.search(r"import\s+{\s*useForm", content), "useForm import missing"
    assert "from '@hookform/resolvers/zod'" in content, "zod resolver import missing"
    assert "Button" in content, "Button component import missing"
    
    # Check for key components and patterns
    assert "export default function CategoriesPage" in content, "Main component export missing"
    assert "const [categories, setCategories] = useState" in content, "Categories state missing"
    assert "const {" in content and "} = useForm" in content, "useForm hook initialization missing"
    assert "handleSubmit" in content, "handleSubmit not used"
    assert "onSubmit" in content, "onSubmit function missing"
    assert "createCategory" in content, "createCategory function missing"
    assert "updateCategory" in content, "updateCategory function missing"
    assert "deleteCategory" in content, "deleteCategory function missing"


def test_categories_page_schema():
    """Test that the Categories page has proper validation schema."""
    with open(categories_page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    assert "categorySchema" in content, "Validation schema missing"
    assert re.search(r"z\.object\(\{", content), "z.object schema definition missing"
    assert re.search(r"name:\s*z\s*\.\s*string\(\)", content), "name field validation missing"
    assert re.search(r"\.min\(", content), "Minimum length validation missing"
    assert re.search(r"\.max\(", content), "Maximum length validation missing"
    assert "type CategoryFormValues" in content, "TypeScript type definition missing"


def test_categories_page_ui_elements():
    """Test that the Categories page has essential UI elements."""
    with open(categories_page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check for form elements
    assert 'id="name"' in content, "Name input missing"
    assert 'id="description"' in content, "Description input missing"
    assert 'id="color"' in content, "Color input missing"
    
    # Check for button actions
    assert re.search(r"onClick={\s*startAddingCategory", content), "Add category button missing"
    assert re.search(r"onClick={\s*\(\)\s*=>\s*startEditingCategory", content), "Edit category button missing"
    assert re.search(r"onClick={\s*\(\)\s*=>\s*deleteCategory", content), "Delete category button missing"
    assert re.search(r"onClick={\s*cancelEditing", content), "Cancel button missing"
    
    # Check for conditional rendering
    assert "isAddingCategory" in content, "isAddingCategory state missing"
    assert "editingCategoryId" in content, "editingCategoryId state missing"
    assert re.search(r"isAddingCategory\s*\|\|\s*editingCategoryId\s*!==\s*null", content), "Conditional form rendering missing" 