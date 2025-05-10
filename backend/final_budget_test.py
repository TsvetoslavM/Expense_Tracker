import requests
import json
import sqlite3
import sys
import os

# Configuration
API_URL = "http://localhost:8000"
DB_FILE = "./test.db"
TEST_USER = {
    "email": "test@example.com",
    "password": "password123"
}

def main():
    """Comprehensive test for both budget creation and retrieval"""
    print("===== COMPREHENSIVE BUDGET FUNCTIONALITY TEST =====")
    
    # Step 1: Verify database connection
    if not os.path.exists(DB_FILE):
        print(f"❌ Database file {DB_FILE} not found!")
        return False
    
    print(f"\nFound database file: {DB_FILE} ({os.path.getsize(DB_FILE) / 1024:.1f} KB)")
    
    # Step 2: Log in to get authentication token
    print("\n1. LOGGING IN TO API")
    token = login()
    if not token:
        print("❌ Cannot continue without authentication token")
        return False
    
    # Step 3: Test budget creation
    print("\n2. CREATING NEW BUDGET THROUGH API")
    budget_data = {
        "amount": 9999.99,
        "year": 2035,
        "month": 12,
        "period": "monthly",
        "currency": "USD",
        "category_id": 2
    }
    
    new_budget = create_budget(token, budget_data)
    if not new_budget:
        print("❌ Failed to create budget")
    else:
        print(f"✅ Budget created with ID: {new_budget['id']}")
    
    # Step 4: Test budget retrieval
    print("\n3. RETRIEVING BUDGETS FROM API")
    budgets = get_budgets(token)
    if not budgets:
        print("❌ Failed to retrieve budgets")
    else:
        print(f"✅ Retrieved {len(budgets)} budgets")
        
        # Check if our newly created budget is in the list
        if new_budget:
            found = False
            for budget in budgets:
                if budget.get('id') == new_budget.get('id'):
                    found = True
                    print(f"✅ Newly created budget (ID: {new_budget['id']}) found in the list")
                    break
            
            if not found:
                print(f"❌ Newly created budget (ID: {new_budget['id']}) NOT found in the list")
    
    # Step 5: Check database directly
    print("\n4. VERIFYING IN DATABASE DIRECTLY")
    verify_database()
    
    print("\n===== TEST COMPLETE =====")
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

def create_budget(token, budget_data):
    """Create a budget through the API"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        print(f"Creating budget with data: {json.dumps(budget_data)}")
        
        response = requests.post(
            f"{API_URL}/api/budgets",
            json=budget_data,
            headers=headers
        )
        
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200 or response.status_code == 201:
            budget = response.json()
            print(f"Budget created successfully with ID: {budget.get('id')}")
            return budget
        else:
            print(f"Failed to create budget: {response.text}")
            return None
    except Exception as e:
        print(f"Error creating budget: {str(e)}")
        return None

def get_budgets(token):
    """Get budgets from the API using the direct endpoint"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        url = f"{API_URL}/api/budgets-list"  # Using our direct endpoint
        print(f"Fetching budgets from: {url}")
        
        response = requests.get(url, headers=headers)
        
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            budgets = response.json()
            
            # Display sample budgets
            if budgets:
                print("\nSample budgets from API:")
                for i, budget in enumerate(budgets[:3]):  # Show first 3 budgets
                    print(f"  {i+1}. ID: {budget['id']}, Amount: {budget['amount']} {budget['currency']}, " +
                          f"Period: {budget['period']} ({budget['year']}-{budget.get('month', 'None')}), " +
                          f"Category: {budget['category_id']}")
                
                if len(budgets) > 3:
                    print(f"  ... and {len(budgets) - 3} more")
            
            return budgets
        else:
            print(f"Failed to retrieve budgets: {response.text}")
            return None
    except Exception as e:
        print(f"Error retrieving budgets: {str(e)}")
        return None

def verify_database():
    """Check the database directly to verify budgets"""
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # Count total budgets
        cursor.execute("SELECT COUNT(*) FROM budgets")
        total = cursor.fetchone()[0]
        print(f"Total budgets in database: {total}")
        
        # Get sample budgets
        cursor.execute("""
            SELECT id, amount, year, month, period, currency, category_id, user_id
            FROM budgets
            ORDER BY id DESC
            LIMIT 3
        """)
        
        rows = cursor.fetchall()
        
        if rows:
            print("\nMost recent budgets in database:")
            for i, row in enumerate(rows):
                print(f"  {i+1}. ID: {row[0]}, Amount: {row[1]} {row[5]}, " +
                      f"Period: {row[4]} ({row[2]}-{row[3]}), " +
                      f"Category: {row[6]}, User: {row[7]}")
        
        conn.close()
        return True
    except Exception as e:
        print(f"Error verifying database: {str(e)}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 