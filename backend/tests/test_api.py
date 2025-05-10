import requests
import json
import sys

# Configuration
API_URL = "http://localhost:8000"
TEST_USER = {
    "email": "test@example.com",
    "password": "password123"
}

def print_separator():
    print("\n" + "="*50 + "\n")

def test_health():
    """Test the health check endpoint"""
    print("Testing health check endpoint...")
    try:
        response = requests.get(f"{API_URL}/api/health")
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def test_login():
    """Test the login endpoint"""
    print("Testing login endpoint...")
    try:
        response = requests.post(
            f"{API_URL}/api/auth/login/json", 
            json=TEST_USER
        )
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            return data.get("access_token")
        else:
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

def test_user_me(token):
    """Test the user/me endpoint"""
    print("Testing user/me endpoint...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_URL}/api/users/me", headers=headers)
        print(f"Status code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def test_categories(token):
    """Test the categories endpoint"""
    print("Testing categories endpoint...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_URL}/api/categories", headers=headers)
        print(f"Status code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def run_tests():
    """Run all tests"""
    print_separator()
    print("Starting API tests...")
    print_separator()
    
    # Test health check
    health_ok = test_health()
    print_separator()
    
    if not health_ok:
        print("Health check failed. Make sure the backend is running.")
        return False
    
    # Test login
    token = test_login()
    print_separator()
    
    if not token:
        print("Login failed. Cannot continue with authenticated tests.")
        return False
    
    # Test user/me
    user_ok = test_user_me(token)
    print_separator()
    
    # Test categories
    categories_ok = test_categories(token)
    print_separator()
    
    # Summary
    print("Test Results:")
    print(f"Health Check: {'✅ PASS' if health_ok else '❌ FAIL'}")
    print(f"Login: {'✅ PASS' if token else '❌ FAIL'}")
    print(f"User Info: {'✅ PASS' if user_ok else '❌ FAIL'}")
    print(f"Categories: {'✅ PASS' if categories_ok else '❌ FAIL'}")
    print_separator()
    
    return health_ok and token and user_ok and categories_ok

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1) 