import requests
import json
import sqlite3

# Configuration
API_URL = "http://localhost:8000"
TEST_USER = {
    "email": "test@example.com",
    "password": "password123"
}
DB_FILE = "./test.db"

def main():
    """Test script to verify budget retrieval from API"""
    print("===== BUDGET RETRIEVAL TEST =====")
    
    # Step 1: Log in to get authentication token
    print("\n1. LOGGING IN TO API")
    token = login()
    if not token:
        print("❌ Cannot continue without authentication token")
        return False
    
    # Step 2: Count budgets in database
    print("\n2. CHECKING DATABASE DIRECTLY")
    db_budgets = count_budgets_in_db()
    print(f"Found {db_budgets} budgets in the database")
    
    # Step 3: Get budgets from API
    print("\n3. FETCHING BUDGETS FROM API")
    api_budgets = get_budgets_from_api(token)
    
    if api_budgets:
        print(f"✅ Successfully retrieved {len(api_budgets)} budgets from API")
        
        # Print first 5 budgets
        print("\nSample of budgets retrieved:")
        for i, budget in enumerate(api_budgets[:5], 1):
            print(f"Budget {i}:")
            print(f"  ID: {budget.get('id')}")
            print(f"  Amount: {budget.get('amount')} {budget.get('currency')}")
            print(f"  Period: {budget.get('period')} ({budget.get('year')}-{budget.get('month') or 'N/A'})")
            print(f"  Category ID: {budget.get('category_id')}")
    else:
        print("❌ Failed to retrieve budgets from API")
    
    # Summary
    print("\n===== SUMMARY =====")
    print(f"Budgets in Database: {db_budgets}")
    print(f"Budgets from API: {len(api_budgets) if api_budgets else 'Failed'}")
    
    if api_budgets and len(api_budgets) != db_budgets:
        print("\n⚠️ WARNING: Number of budgets in database and from API doesn't match!")
        print("This could indicate a filtering issue or that API is using a different database.")
    
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

def count_budgets_in_db():
    """Count budgets in the database"""
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # Count all budgets
        cursor.execute("SELECT COUNT(*) FROM budgets")
        count = cursor.fetchone()[0]
        
        # Get some info about budgets
        cursor.execute("""
            SELECT id, amount, year, month, period, currency, category_id
            FROM budgets
            LIMIT 5
        """)
        budgets = cursor.fetchall()
        
        print("Sample budgets in database:")
        for budget in budgets:
            print(f"  ID: {budget[0]}, Amount: {budget[1]} {budget[5]}, "
                  f"Period: {budget[4]} ({budget[2]}-{budget[3] or 'N/A'}), Category: {budget[6]}")
        
        conn.close()
        return count
    except Exception as e:
        print(f"❌ Error counting budgets in database: {str(e)}")
        return 0

def get_budgets_from_api(token):
    """Get budgets from the API and print them"""
    print("Fetching budgets from API")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{API_URL}/api/budgets/list",  # Updated URL to use the new endpoint
            headers=headers
        )
        
        print(f"API Response: Status {response.status_code}")
        
        if response.status_code == 200:
            budgets = response.json()
            print(f"Successfully retrieved {len(budgets)} budgets from API")
            
            # Print first few budgets as a sample
            if budgets:
                print("Sample budgets:")
                for i, budget in enumerate(budgets[:3]):  # Show first 3 budgets
                    print(f"  {i+1}. ID: {budget['id']}, Amount: {budget['amount']} {budget['currency']}, " +
                          f"Period: {budget['period']} ({budget['year']}-{budget['month']}), Category: {budget['category_id']}")
                
                if len(budgets) > 3:
                    print(f"  ... and {len(budgets) - 3} more")
            
            return budgets
        else:
            print(f"Failed to retrieve budgets: {response.status_code} {response.reason}")
            try:
                print(f"Error details: {response.json()}")
            except:
                print(f"Error response: {response.text}")
            return None
    except Exception as e:
        print(f"Exception during API request: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    main() 