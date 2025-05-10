import requests
import json

# Configuration
API_URL = "http://localhost:8000"
TEST_USER = {
    "email": "test@example.com",
    "password": "password123"
}

def test_login_api():
    """Test the login API endpoint directly"""
    print("\nTesting login API endpoint...")
    
    try:
        # Make the request with detailed logging
        print(f"Sending POST request to {API_URL}/api/auth/login/json")
        print(f"Request payload: {json.dumps(TEST_USER)}")
        
        response = requests.post(
            f"{API_URL}/api/auth/login/json", 
            json=TEST_USER,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Response status code: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
        # Try to parse the response as JSON
        try:
            response_data = response.json()
            print(f"Response body: {json.dumps(response_data, indent=2)}")
        except:
            print(f"Response body (not JSON): {response.text}")
        
        # Return success if status code is 200
        return response.status_code == 200
        
    except Exception as e:
        print(f"Error during API request: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_login_api()
    print(f"\nLogin test {'succeeded' if success else 'failed'}")
    exit(0 if success else 1) 