import requests
import json

# Configuration
API_URL = "http://localhost:8000"
TEST_USER = {
    "email": "test@example.com",
    "password": "password123"
}

def main():
    """Test budget creation directly"""
    print("=== Budget Creation Test ===")
    
    # Step 1: Login to get token
    print("Logging in...")
    try:
        login_response = requests.post(
            f"{API_URL}/api/auth/login/json",
            json=TEST_USER
        )
        
        if login_response.status_code != 200:
            print(f"Login failed with status: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            return
        
        token_data = login_response.json()
        token = token_data.get("access_token")
        if not token:
            print("No token received!")
            return
            
        print("Login successful\n")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Step 2: Get categories
        print("Getting categories...")
        categories_response = requests.get(
            f"{API_URL}/api/categories",
            headers=headers
        )
        
        if categories_response.status_code != 200:
            print(f"Failed to get categories: {categories_response.status_code}")
            return
            
        categories = categories_response.json()
        if not categories:
            print("No categories found!")
            return
            
        # Use the first category
        category_id = categories[0]["id"] if categories else 2
        print(f"Using category ID: {category_id}\n")
        
        # Step 3: Create a budget
        print("Creating budget...")
        budget_data = {
            "amount": 1000.0,  # This is required!
            "year": 2026,      # Changed from 2025 to avoid duplication
            "month": 11,       # Changed from 10 to avoid duplication
            "period": "monthly",
            "currency": "USD",
            "category_id": category_id
        }
        
        # Log the data we're sending
        print("Budget data:")
        print(json.dumps(budget_data, indent=2))
        
        budget_response = requests.post(
            f"{API_URL}/api/budgets",
            headers=headers,
            json=budget_data
        )
        
        print(f"Response status: {budget_response.status_code}")
        
        if budget_response.status_code == 200 or budget_response.status_code == 201:
            print("Budget created successfully!")
            budget = budget_response.json()
            print("Budget details:")
            print(json.dumps(budget, indent=2))
            print("\nTest passed!")
        else:
            print(f"Error creating budget: {budget_response.reason}")
            print(f"Response: {budget_response.text}")
            print("\nTest failed!")
            
    except Exception as e:
        print(f"Error: {str(e)}")
        print("\nTest failed!")

if __name__ == "__main__":
    main() 