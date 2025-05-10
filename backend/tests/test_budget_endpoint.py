import requests
import json


# Configuration
API_URL = "http://localhost:8000"
TEST_USER = {
    "email": "test@example.com",
    "password": "password123"
}

def main():
    """Test script for the budget test endpoint"""
    print("===== TESTING BUDGET TEST ENDPOINT =====")
    
    # Step 1: Log in to get authentication token
    print("\n1. LOGGING IN TO API")
    token = login()
    if not token:
        print("❌ Cannot continue without authentication token")
        return False
    
    # Step 2: Test the budget test endpoint
    print("\n2. TESTING /api/budgets/test ENDPOINT")
    test_budget_endpoint(token)
    
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
        return None

def test_budget_endpoint(token):
    """Test the budget test endpoint"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        print(f"Sending GET request to {API_URL}/api/budgets/test")
        
        response = requests.get(
            f"{API_URL}/api/budgets/test",
            headers=headers
        )
        
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Test endpoint working!")
            print(f"Response data: {json.dumps(data, indent=2)}")
            return True
        else:
            print(f"❌ Test endpoint failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    main() 