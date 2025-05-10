import requests
import json

# Configuration
API_URL = "http://localhost:8000"
TEST_USER = {
    "email": "test@example.com",
    "password": "password123"
}

def main():
    """Test script for the budget list endpoint"""
    print("===== TESTING BUDGET LIST ENDPOINT =====")
    
    # Step 1: Log in to get authentication token
    print("\n1. LOGGING IN TO API")
    token = login()
    if not token:
        print("❌ Cannot continue without authentication token")
        return False
    
    # Step 2: Test the budget list endpoint
    print("\n2. TESTING /api/budgets/list ENDPOINT")
    test_list_endpoint(token)
    
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

def test_list_endpoint(token):
    """Test the budget list endpoint"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        url = f"{API_URL}/api/budgets/list"
        print(f"Sending GET request to {url}")
        
        response = requests.get(url, headers=headers)
        
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            budgets = response.json()
            print("✅ List endpoint working!")
            print(f"Retrieved {len(budgets)} budgets")
            
            # Display sample budgets
            if budgets:
                print("\nSample budgets:")
                for i, budget in enumerate(budgets[:3]):  # Show first 3 budgets
                    print(f"  {i+1}. ID: {budget['id']}, Amount: {budget['amount']} {budget['currency']}, " +
                          f"Period: {budget['period']} ({budget['year']}-{budget.get('month', 'None')}), " +
                          f"Category: {budget['category_id']}")
                
                if len(budgets) > 3:
                    print(f"  ... and {len(budgets) - 3} more")
            return True
        else:
            print(f"❌ List endpoint failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    main() 