"""
Test module for authentication-related pages in the frontend.
These tests focus on structure and functionality validation without requiring backend connectivity.
"""

import os
import re
import pytest
from pathlib import Path

# Get the frontend directory path
FRONTEND_DIR = Path(os.environ.get('FRONTEND_DIR', '../../frontend'))

def test_login_page_exists():
    """Verify that the login page exists"""
    login_page_path = FRONTEND_DIR / 'pages' / 'login.tsx'
    assert login_page_path.exists(), "Login page does not exist"
    
    # Check content to verify it's a proper login page
    with open(login_page_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    assert 'LoginPage' in content, "LoginPage component not found"
    assert 'form' in content.lower(), "No form element found in login page"
    assert 'password' in content.lower(), "No password field found in login page"
    assert 'email' in content.lower(), "No email field found in login page"
    assert 'submit' in content.lower(), "No submit button found in login page"

def test_register_page_exists():
    """Verify that the register page exists"""
    register_page_path = FRONTEND_DIR / 'pages' / 'register.tsx'
    assert register_page_path.exists(), "Register page does not exist"
    
    # Check content to verify it's a proper registration page
    with open(register_page_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    assert 'RegisterPage' in content, "RegisterPage component not found"
    assert 'form' in content.lower(), "No form element found in register page"
    assert 'password' in content.lower(), "No password field found in register page"
    assert 'email' in content.lower(), "No email field found in register page"
    assert 'submit' in content.lower(), "No submit button found in register page"

def test_auth_context_implementation():
    """Verify that the auth context is properly implemented"""
    auth_context_path = FRONTEND_DIR / 'context' / 'AuthContext.tsx'
    assert auth_context_path.exists(), "AuthContext file does not exist"
    
    with open(auth_context_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check for essential auth functions
    assert 'login' in content, "login function not found in AuthContext"
    assert 'logout' in content, "logout function not found in AuthContext"
    assert 'register' in content, "register function not found in AuthContext"
    assert 'isAuthenticated' in content, "isAuthenticated state not found in AuthContext"
    assert 'user' in content, "user state not found in AuthContext"

def test_index_redirects():
    """Verify that the index page redirects to dashboard or login"""
    index_page_path = FRONTEND_DIR / 'pages' / 'index.tsx'
    assert index_page_path.exists(), "Index page does not exist"
    
    with open(index_page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check for redirects
    assert 'router.replace' in content, "No routing/redirect functions found in index page"
    assert "'/dashboard'" in content, "No redirect to dashboard found in index page"
    assert "'/login'" in content, "No redirect to login found in index page"
    assert 'isAuthenticated' in content, "No authentication check found in index page"

def test_protected_route_implementation():
    """Verify protected route implementation exists and works properly"""
    # Check if there's a route protection component or logic
    components_dir = FRONTEND_DIR / 'components'
    
    # Look for protected route component or HOC
    protected_route_exists = False
    
    if components_dir.exists():
        for file_path in components_dir.glob('**/*.tsx'):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if (re.search(r'Protected(Route|Page|Layout)', content) or 
                    'isAuthenticated' in content and 'redirect' in content):
                    protected_route_exists = True
                    break
    
    # If not found in components, check in _app.tsx for global auth protection
    if not protected_route_exists:
        app_path = FRONTEND_DIR / 'pages' / '_app.tsx'
        if app_path.exists():
            with open(app_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if 'AuthProvider' in content:
                    protected_route_exists = True
    
    assert protected_route_exists, "Could not find protected route implementation"

def test_logout_functionality():
    """Verify that logout functionality is properly implemented"""
    auth_context_path = FRONTEND_DIR / 'context' / 'AuthContext.tsx'
    
    with open(auth_context_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check for proper logout implementation
    assert 'localStorage.removeItem' in content, "localStorage cleanup not found in logout function"
    assert "router.push('/login')" in content, "No redirect to login page after logout"

if __name__ == "__main__":
    pytest.main(["-xvs", __file__]) 