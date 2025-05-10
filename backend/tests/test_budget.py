import requests
import json

# Configuration
API_URL = "http://localhost:8000"
TEST_USER = {
    "email": "test@example.com",
    "password": "password123"
}

def test_create_budget():
    """Test creating a budget through the API"""
    print("\n=== Testing Budget Creation ===")
    
    # Step 1: Login to get token
    print("\n1. Logging in to get auth token...")
    try:
        login_response = requests.post(
            f"{API_URL}/api/auth/login/json", 
            json=TEST_USER
        )
        
        if login_response.status_code != 200:
            print(f"Login failed with status code: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            return False
            
        token_data = login_response.json()
        access_token = token_data.get("access_token")
        
        if not access_token:
            print("No access token received")
            return False
            
        print("Successfully obtained access token")
        
        # Step 2: Get categories
        print("\n2. Fetching categories...")
        headers = {"Authorization": f"Bearer {access_token}"}
        
        categories_response = requests.get(
            f"{API_URL}/api/categories",
            headers=headers
        )
        
        if categories_response.status_code != 200:
            print(f"Failed to fetch categories: {categories_response.status_code}")
            print(f"Response: {categories_response.text}")
            return False
            
        categories = categories_response.json()
        
        if not categories or len(categories) == 0:
            print("No categories found. Creating a default category...")
            # Create a default category
            category_data = {
                "name": "Test Category",
                "color": "#FF5733",
                "description": "Category for testing"
            }
            
            category_response = requests.post(
                f"{API_URL}/api/categories",
                json=category_data,
                headers=headers
            )
            
            if category_response.status_code != 200 and category_response.status_code != 201:
                print(f"Failed to create category: {category_response.status_code}")
                print(f"Response: {category_response.text}")
                return False
                
            category = category_response.json()
            category_id = category.get("id")
        else:
            # Use the first category
            category_id = categories[0].get("id")
            
        print(f"Using category ID: {category_id}")
        
        # Step 3: Create a budget
        print("\n3. Creating a budget...")
        import datetime
        current_year = datetime.datetime.now().year
        current_month = datetime.datetime.now().month
        
        # Ensure amount is a positive float value
        budget_data = {
            "amount": 1000.00,
            "year": current_year,
            "month": current_month,
            "period": "monthly",
            "currency": "USD",
            "category_id": category_id
        }
        
        print(f"Budget data: {json.dumps(budget_data, indent=2)}")
        
        budget_response = requests.post(
            f"{API_URL}/api/budgets",
            json=budget_data,
            headers=headers
        )
        
        print(f"Response status code: {budget_response.status_code}")
        
        try:
            response_data = budget_response.json()
            print(f"Response data: {json.dumps(response_data, indent=2)}")
        except:
            print(f"Response text (not JSON): {budget_response.text}")
        
        if budget_response.status_code not in [200, 201]:
            print("Budget creation failed")
            return False
            
        print("Budget created successfully!")
        return True
        
    except Exception as e:
        print(f"Error during test: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_create_budget()
    print(f"\nTest {'succeeded' if success else 'failed'}")
    exit(0 if success else 1) 