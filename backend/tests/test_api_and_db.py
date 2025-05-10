import requests
import json
import time
from app.core.database import SessionLocal
from sqlalchemy import text

# Configuration
API_URL = "http://localhost:8000"
TEST_USER = {
    "email": "test@example.com",
    "password": "password123"
}

def main():
    """Test that combines API calls and direct database verification"""
    print("=== API and Database Integration Test ===")
    
    # Generate a unique month for testing (to avoid conflicts)
    test_month = int(time.time()) % 12 + 1
    print(f"Using test month: {test_month}")
    
    # Step 1: Login to get token
    print("\n[1] Logging in to get authentication token...")
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
            
        print("✅ Login successful")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Step 2: Get categories
        print("\n[2] Getting categories...")
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
        print(f"✅ Using category ID: {category_id}")
        
        # Step 3: Check database state before test
        print("\n[3] Checking database state before API call...")
        db = SessionLocal()
        try:
            result = db.execute(text(f"SELECT COUNT(*) FROM budgets WHERE year=2030 AND month={test_month}"))
            count_before = result.fetchone()[0]
            print(f"Found {count_before} matching budgets in database before API call")
        finally:
            db.close()
        
        # Step 4: Create a budget via API
        print("\n[4] Creating budget via API...")
        budget_data = {
            "amount": 1500.0,
            "year": 2030,  # Using a far-future year to avoid conflicts
            "month": test_month,
            "period": "monthly",
            "currency": "USD",
            "category_id": category_id
        }
        
        print("Budget data:")
        print(json.dumps(budget_data, indent=2))
        
        budget_response = requests.post(
            f"{API_URL}/api/budgets",
            headers=headers,
            json=budget_data
        )
        
        print(f"Response status: {budget_response.status_code}")
        
        if budget_response.status_code == 200 or budget_response.status_code == 201:
            print("✅ Budget creation API call successful")
            budget = budget_response.json()
            print("Budget details from API response:")
            print(json.dumps(budget, indent=2))
            budget_id = budget.get("id")
            print(f"Retrieved budget ID from API: {budget_id}")
        else:
            print(f"❌ API Error: {budget_response.reason}")
            print(f"Response: {budget_response.text}")
            return
            
        # Step 5: Verify budget was added to database
        print("\n[5] Checking database state after API call...")
        db = SessionLocal()
        try:
            # Check by year/month/category criteria
            result = db.execute(text(f"""
                SELECT id, amount, year, month, period, category_id, user_id 
                FROM budgets 
                WHERE year=2030 AND month={test_month}
            """))
            matching_budgets = result.fetchall()
            
            if matching_budgets:
                print(f"✅ Found {len(matching_budgets)} matching budgets in database:")
                for b in matching_budgets:
                    print(f"  - ID: {b[0]}, Amount: {b[1]}, Year: {b[2]}, Month: {b[3]}, Category: {b[5]}")
                    
                if len(matching_budgets) > count_before:
                    print("✅ TEST PASSED: New budget was added to database")
                else:
                    print("❌ TEST FAILED: No new budget found in database")
            else:
                print("❌ No matching budgets found in database after API call!")
                
            # If we have a budget ID, try to find it directly
            if budget_id:
                result = db.execute(text(f"SELECT id, amount, year, month FROM budgets WHERE id={budget_id}"))
                direct_match = result.fetchone()
                if direct_match:
                    print(f"✅ Found budget with ID {budget_id} directly in database: {direct_match}")
                else:
                    print(f"❌ Could not find budget with ID {budget_id} in database")
                    
            # Check all budgets in database
            result = db.execute(text("SELECT COUNT(*) FROM budgets"))
            total_count = result.fetchone()[0]
            print(f"Total budget count in database: {total_count}")
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"Error during test: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 