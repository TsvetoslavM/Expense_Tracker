import requests
import json
import traceback
import sys

# Configuration
API_URL = "http://localhost:8000"
TEST_USER = {
    "email": "test@example.com",
    "password": "password123"
}

def main():
    """Debug script to diagnose API budget retrieval issues with detailed error reporting"""
    print("===== API BUDGETS DEBUG SCRIPT =====")
    
    # Step 1: Log in to get authentication token
    print("\n1. LOGGING IN TO API")
    token = login()
    if not token:
        print("❌ Cannot continue without authentication token")
        return False
    
    # Step 2: Get API health check
    print("\n2. CHECKING API HEALTH")
    health_check(token)
    
    # Step 3: Test retrieving budgets with detailed error handling
    print("\n3. FETCHING BUDGETS FROM API (WITH DETAILED ERROR HANDLING)")
    try:
        api_budgets = get_budgets_with_debugging(token)
        if api_budgets:
            print(f"✅ Successfully retrieved {len(api_budgets)} budgets from API")
        else:
            print("❌ No budgets retrieved from API")
    except Exception as e:
        print(f"❌ Unhandled exception: {str(e)}")
        traceback.print_exc()
    
    print("\n===== END OF DEBUG SCRIPT =====")
    return True

def login():
    """Login to the API and get authentication token"""
    try:
        print(f"Logging in as {TEST_USER['email']}")
        response = requests.post(
            f"{API_URL}/api/auth/login/json",
            json=TEST_USER
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            print(f"✅ Login successful, token obtained")
            return token
        else:
            print(f"❌ Login failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error during login: {str(e)}")
        traceback.print_exc()
        return None

def health_check(token):
    """Check if the API is responding to basic requests"""
    endpoints = [
        "/api/users/me",        # Current user
        "/api/categories",      # Categories (should work if permissions are set)
    ]
    
    for endpoint in endpoints:
        try:
            print(f"Testing endpoint: {endpoint}")
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{API_URL}{endpoint}", headers=headers)
            
            print(f"Status code: {response.status_code}")
            if response.status_code == 200:
                print("✅ Endpoint working")
            else:
                print(f"❌ Endpoint failed: {response.text}")
        except Exception as e:
            print(f"❌ Exception while accessing {endpoint}: {str(e)}")
            traceback.print_exc()

def get_budgets_with_debugging(token):
    """Get budgets from API with detailed error handling"""
    try:
        print("Preparing GET request for budgets")
        headers = {"Authorization": f"Bearer {token}"}
        url = f"{API_URL}/api/budgets"
        
        print(f"Request URL: {url}")
        print(f"Headers: {headers}")
        
        # Make the request with a longer timeout
        print("Sending request...")
        response = requests.get(url, headers=headers, timeout=10)
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {response.headers}")
        
        if response.status_code == 200:
            try:
                budgets = response.json()
                print(f"Successfully parsed JSON response")
                return budgets
            except json.JSONDecodeError as e:
                print(f"❌ Error decoding JSON response: {str(e)}")
                print(f"Response text: {response.text[:200]}...")  # Print first 200 chars
                return None
        else:
            try:
                error_data = response.json()
                print(f"Error response (JSON): {json.dumps(error_data, indent=2)}")
            except:
                print(f"Error response (text): {response.text}")
            return None
    except requests.RequestException as e:
        print(f"❌ Request exception: {type(e).__name__}: {str(e)}")
        traceback.print_exc()
        return None
    except Exception as e:
        print(f"❌ Unexpected error: {type(e).__name__}: {str(e)}")
        traceback.print_exc()
        return None

if __name__ == "__main__":
    main() 