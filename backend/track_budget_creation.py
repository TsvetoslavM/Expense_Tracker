import requests
import json
import sqlite3
import time
from datetime import datetime
from sqlalchemy import text, create_engine
from sqlalchemy.orm import sessionmaker

# Configuration
API_URL = "http://localhost:8000"
TEST_USER = {
    "email": "test@example.com",
    "password": "password123"
}
# Use test.db since that's what the API is using
DB_FILE = "./test.db"

def main():
    """Test script to track budget creation through API and database"""
    print("===== BUDGET CREATION TRACKING SCRIPT =====")
    
    # Generate a unique test ID to track this specific test
    test_id = int(time.time()) % 10000
    print(f"Test ID: {test_id}")
    print(f"Using database file: {DB_FILE}")
    
    # Step 1: Log in to get authentication token
    print("\n1. LOGGING IN TO API")
    token = login()
    if not token:
        print("❌ Cannot continue without authentication token")
        return False
    
    # Step 2: Create a budget through the API
    print("\n2. CREATING BUDGET THROUGH API")
    year = 2035  # Use a far-future year to avoid conflicts
    month = 3
    amount = 3000.0 + (test_id / 10)  # Make the amount unique with test ID
    
    budget_data = {
        "amount": amount,
        "year": year,
        "month": month,
        "period": "monthly",
        "currency": "USD",
        "category_id": 2  # Assuming category ID 2 exists
    }
    print(f"Budget data: {json.dumps(budget_data, indent=2)}")
    
    budget_id = create_budget_api(token, budget_data)
    if not budget_id:
        print("❌ API budget creation failed")
    else:
        print(f"✅ API returned budget ID: {budget_id}")
    
    # Step 3: Check if the budget exists in the database directly
    print("\n3. CHECKING DATABASE DIRECTLY")
    
    # Wait a moment to ensure any async operations complete
    print("Waiting 1 second for any async operations...")
    time.sleep(1)
    
    # Check with direct SQLite connection
    sqlite_budget = check_budget_sqlite(year, month, amount)
    if sqlite_budget:
        print(f"✅ Found budget in SQLite: {sqlite_budget}")
    else:
        print("❌ Budget NOT found in SQLite database")
    
    # Check with SQLAlchemy ORM
    sqlalchemy_budget = check_budget_sqlalchemy(year, month, amount)
    if sqlalchemy_budget:
        print(f"✅ Found budget in SQLAlchemy: {sqlalchemy_budget}")
    else:
        print("❌ Budget NOT found with SQLAlchemy")
    
    # Step 4: Try to create the same budget directly in the database
    print("\n4. CREATING BUDGET DIRECTLY IN DATABASE")
    direct_id = create_budget_direct(budget_data)
    if direct_id:
        print(f"✅ Direct database insertion successful with ID: {direct_id}")
    else:
        print("❌ Direct database insertion failed")
    
    # Summary
    print("\n===== SUMMARY =====")
    print(f"API Budget ID: {budget_id if budget_id else 'Failed'}")
    print(f"Found in SQLite: {'Yes' if sqlite_budget else 'No'}")
    print(f"Found with SQLAlchemy: {'Yes' if sqlalchemy_budget else 'No'}")
    print(f"Direct insertion ID: {direct_id if direct_id else 'Failed'}")
    
    if budget_id and not (sqlite_budget or sqlalchemy_budget):
        print("\n⚠️ ISSUE DETECTED: Budget created through API but not found in database.")
        print("This suggests a transaction issue or the API is using a different database.")
        
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

def create_budget_api(token, budget_data):
    """Create a budget through the API"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        print(f"Sending POST request to {API_URL}/api/budgets")
        
        response = requests.post(
            f"{API_URL}/api/budgets",
            json=budget_data,
            headers=headers
        )
        
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            budget = response.json()
            print("API response data:")
            print(json.dumps(budget, indent=2))
            return budget.get("id")
        else:
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error creating budget through API: {str(e)}")
        return None

def check_budget_sqlite(year, month, amount):
    """Check if the budget exists in the database using direct SQLite"""
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # Query for the specific budget
        cursor.execute("""
            SELECT id, amount, year, month, period, currency, category_id, user_id 
            FROM budgets 
            WHERE year=? AND month=? AND amount=?
        """, (year, month, amount))
        
        budget = cursor.fetchone()
        conn.close()
        
        return budget
    except Exception as e:
        print(f"❌ Error checking budget with SQLite: {str(e)}")
        return None

def check_budget_sqlalchemy(year, month, amount):
    """Check if the budget exists in the database using SQLAlchemy"""
    try:
        # Create engine and session
        engine = create_engine(f"sqlite:///{DB_FILE}")
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # Query using SQLAlchemy's text function
        result = session.execute(text("""
            SELECT id, amount, year, month, period, currency, category_id, user_id 
            FROM budgets 
            WHERE year=:year AND month=:month AND amount=:amount
        """), {
            "year": year,
            "month": month,
            "amount": amount
        })
        
        budget = result.fetchone()
        session.close()
        
        return budget
    except Exception as e:
        print(f"❌ Error checking budget with SQLAlchemy: {str(e)}")
        return None

def create_budget_direct(budget_data):
    """Create a budget directly in the database"""
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # Insert the budget
        now = datetime.utcnow().isoformat()
        cursor.execute("""
            INSERT INTO budgets 
            (amount, year, month, period, currency, category_id, user_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            budget_data["amount"],
            budget_data["year"],
            budget_data["month"],
            budget_data["period"],
            budget_data["currency"],
            budget_data["category_id"],
            1,  # Assuming user ID 1
            now,
            now
        ))
        
        # Get the inserted ID
        cursor.execute("SELECT last_insert_rowid()")
        budget_id = cursor.fetchone()[0]
        
        # Commit the transaction
        conn.commit()
        conn.close()
        
        return budget_id
    except Exception as e:
        print(f"❌ Error creating budget directly: {str(e)}")
        return None

if __name__ == "__main__":
    main() 