"""
Test API compatibility with Python 3.13.

This module provides simplified API testing capabilities compatible with Python 3.13,
using socket timeout control to prevent hanging and with improved error handling.
"""

import os
import sys
import json
import socket
import http.client
from urllib.parse import urlparse
from pathlib import Path

# Add the parent directory to Python path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
    print(f"Added {parent_dir} to Python path")

# Default timeout in seconds for all socket operations
DEFAULT_TIMEOUT = 2

def parse_url(url):
    """Parse URL into components."""
    parsed = urlparse(url)
    return {
        'scheme': parsed.scheme,
        'hostname': parsed.hostname,
        'port': parsed.port or (443 if parsed.scheme == 'https' else 80),
        'path': parsed.path + ('?' + parsed.query if parsed.query else '')
    }

def make_http_request(url, method='GET', headers=None, data=None, timeout=DEFAULT_TIMEOUT):
    """
    Make an HTTP request using http.client which is built into Python.
    
    Args:
        url (str): The URL to send the request to
        method (str): HTTP method (GET, POST, etc.)
        headers (dict): HTTP headers
        data (dict or str): Data to send in the request body
        timeout (int): Socket timeout in seconds
        
    Returns:
        dict: Response with status, headers, and body
    """
    socket.setdefaulttimeout(timeout)
    
    parsed = parse_url(url)
    
    if headers is None:
        headers = {}
    
    # Prepare data for sending
    body = None
    if data:
        if isinstance(data, dict):
            body = json.dumps(data).encode('utf-8')
            headers['Content-Type'] = 'application/json'
        else:
            body = data.encode('utf-8') if isinstance(data, str) else data
    
    if body:
        headers['Content-Length'] = str(len(body))
    
    # Create the appropriate connection
    try:
        if parsed['scheme'] == 'https':
            conn = http.client.HTTPSConnection(parsed['hostname'], parsed['port'], timeout=timeout)
        else:
            conn = http.client.HTTPConnection(parsed['hostname'], parsed['port'], timeout=timeout)
        
        # Make the request
        conn.request(method, parsed['path'], body, headers)
        
        # Get the response
        response = conn.getresponse()
        response_body = response.read()
        
        # Format the response
        result = {
            'status': response.status,
            'reason': response.reason,
            'headers': dict(response.getheaders()),
            'body': response_body
        }
        
        # Try to parse JSON response
        if response_body:
            try:
                result['json'] = json.loads(response_body)
            except json.JSONDecodeError:
                result['text'] = response_body.decode('utf-8', errors='replace')
        
        conn.close()
        return result
    
    except socket.timeout:
        return {
            'status': 408,
            'reason': 'Request Timeout',
            'error': 'The request timed out after {} seconds'.format(timeout)
        }
    except ConnectionRefusedError:
        return {
            'status': 503,
            'reason': 'Service Unavailable',
            'error': 'Connection refused. Is the server running?'
        }
    except Exception as e:
        return {
            'status': 500,
            'reason': 'Internal Error',
            'error': str(e)
        }

def test_health_endpoint():
    """Test the health endpoint."""
    print("Testing health endpoint...")
    
    url = "http://localhost:8000/api/health"
    response = make_http_request(url)
    
    if response.get('status') == 200:
        print("✅ Health endpoint is working!")
        print(f"Response: {json.dumps(response.get('json', {}), indent=2)}")
        return True
    else:
        print("❌ Health endpoint test failed!")
        print(f"Status: {response.get('status')} - {response.get('reason')}")
        print(f"Error: {response.get('error', 'Unknown error')}")
        return False

def test_auth_endpoint():
    """Test the authentication endpoints."""
    print("\nTesting authentication endpoints...")
    
    # Test registration endpoint
    register_url = "http://localhost:8000/api/auth/register"
    register_data = {
        "email": "test@example.com",
        "password": "Password123",
        "first_name": "Test",
        "last_name": "User",
        "preferred_currency": "USD"
    }
    
    print("Testing registration endpoint...")
    register_response = make_http_request(
        register_url, 
        method='POST', 
        headers={"Content-Type": "application/json"},
        data=register_data
    )
    
    # If registration succeeded or user already exists, try login
    if register_response.get('status') in (200, 201, 400):
        if register_response.get('status') == 400:
            print("ℹ️ Registration returned 400 - user might already exist.")
        else:
            print("✅ Registration endpoint is working!")
            print(f"Status: {register_response.get('status')} - {register_response.get('reason')}")
        
        # Test login endpoint
        login_url = "http://localhost:8000/api/auth/login/json"
        login_data = {
            "email": "test@example.com",
            "password": "Password123"
        }
        
        print("\nTesting login endpoint...")
        login_response = make_http_request(
            login_url, 
            method='POST', 
            headers={"Content-Type": "application/json"},
            data=login_data
        )
        
        if login_response.get('status') == 200:
            print("✅ Login endpoint is working!")
            # Don't print the token for security, just confirm we got one
            token = login_response.get('json', {}).get('access_token')
            if token:
                print("✅ Received access token successfully!")
            else:
                print("❌ No access token in response!")
            return True
        else:
            print("❌ Login endpoint test failed!")
            print(f"Status: {login_response.get('status')} - {login_response.get('reason')}")
            print(f"Error: {login_response.get('error', 'Unknown error')}")
            return False
    else:
        print("❌ Registration endpoint test failed!")
        print(f"Status: {register_response.get('status')} - {register_response.get('reason')}")
        print(f"Error: {register_response.get('error', 'Unknown error')}")
        return False

def run_all_tests():
    """Run all API compatibility tests."""
    print("="*60)
    print("RUNNING API COMPATIBILITY TESTS WITH PYTHON 3.13")
    print("="*60)
    
    # Check if the server seems to be running
    server_status = make_http_request("http://localhost:8000/")
    if server_status.get('status') in (404, 200, 401, 403, 301, 302):
        print("✅ Server appears to be running")
    else:
        print("❌ Server does not appear to be running!")
        print(f"Error: {server_status.get('error', 'Unknown error')}")
        print("Please start the server before running these tests.")
        return
    
    # Run tests and count successes
    test_results = [
        test_health_endpoint(),
        test_auth_endpoint()
    ]
    
    success_count = sum(1 for result in test_results if result)
    total_count = len(test_results)
    
    print("\n" + "="*60)
    print(f"TEST SUMMARY: {success_count} of {total_count} tests passed")
    print("="*60)

if __name__ == "__main__":
    run_all_tests() 