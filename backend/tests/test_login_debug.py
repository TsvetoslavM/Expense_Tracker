from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password, get_password_hash
import requests
import json
import sys

# Configuration
API_URL = "http://localhost:8000"
TEST_USER = {
    "email": "test@example.com",
    "password": "password123"
}

def check_user_in_db():
    """Check if the user exists in the database and has the correct password hash"""
    print("\n1. CHECKING USER IN DATABASE:")
    
    # Create a database session
    db = SessionLocal()
    
    try:
        # Get the user from the database
        user = db.query(User).filter(User.email == TEST_USER["email"]).first()
        
        if not user:
            print(f"❌ User '{TEST_USER['email']}' not found in database!")
            return False
            
        print(f"✅ User found: {user.email} (ID: {user.id})")
        print(f"   is_active: {user.is_active}")
        print(f"   hashed_password: {user.hashed_password[:20]}...")
        
        # Test password verification
        is_password_correct = verify_password(TEST_USER["password"], user.hashed_password)
        if is_password_correct:
            print(f"✅ Password verification successful")
        else:
            print(f"❌ Password verification failed!")
        
        return is_password_correct
    except Exception as e:
        print(f"❌ Error checking user in database: {str(e)}")
        return False
    finally:
        db.close()

def recreate_test_user():
    """Recreate the test user with a fresh password hash"""
    print("\n2. RECREATING TEST USER:")
    
    # Create a database session
    db = SessionLocal()
    
    try:
        # Delete existing user if it exists
        user = db.query(User).filter(User.email == TEST_USER["email"]).first()
        if user:
            print(f"   Deleting existing user: {user.email}")
            db.delete(user)
            db.commit()
        
        # Create new test user
        new_hash = get_password_hash(TEST_USER["password"])
        print(f"   New password hash: {new_hash[:20]}...")
        
        new_user = User(
            email=TEST_USER["email"],
            hashed_password=new_hash,
            is_active=True,
            is_admin=False,
            first_name="Test",
            last_name="User",
            preferred_currency="USD"
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        print(f"✅ Test user recreated with ID: {new_user.id}")
        return True
    except Exception as e:
        print(f"❌ Error recreating test user: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()

def test_login_api():
    """Test the login API endpoint"""
    print("\n3. TESTING LOGIN API:")
    
    try:
        # Make the request
        print(f"   Sending POST request to {API_URL}/api/auth/login/json")
        print(f"   Request payload: {json.dumps(TEST_USER)}")
        
        response = requests.post(
            f"{API_URL}/api/auth/login/json", 
            json=TEST_USER,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"   Response status code: {response.status_code}")
        
        # Try to parse the response as JSON
        try:
            response_data = response.json()
            print(f"   Response body: {json.dumps(response_data, indent=2)}")
        except:
            print(f"   Response body (not JSON): {response.text}")
        
        if response.status_code == 200:
            print(f"✅ Login API test successful")
            return True
        else:
            print(f"❌ Login API test failed with status code {response.status_code}")
            return False
        
    except Exception as e:
        print(f"❌ Error during API request: {str(e)}")
        return False

if __name__ == "__main__":
    print("===== AUTHENTICATION DEBUG SCRIPT =====")
    
    # Step 1: Check if user exists and password verification works
    db_check_ok = check_user_in_db()
    
    # Step 2: If database check failed, recreate the user
    if not db_check_ok:
        print("\nTrying to fix by recreating the test user...")
        recreate_test_user()
        # Verify the fix worked
        db_check_ok = check_user_in_db()
    
    # Step 3: Test the login API
    api_ok = test_login_api()
    
    # Summary
    print("\n===== RESULTS =====")
    print(f"Database user check: {'✅ PASS' if db_check_ok else '❌ FAIL'}")
    print(f"Login API test: {'✅ PASS' if api_ok else '❌ FAIL'}")
    
    if not api_ok and db_check_ok:
        print("\nPOSSIBLE ISSUE: User exists and password is correct, but API login fails.")
        print("This suggests an issue with the login endpoint or token generation.")
    
    sys.exit(0 if db_check_ok and api_ok else 1) 