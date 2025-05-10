from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password
import sys

def test_user_auth():
    """Test if the user exists and password verification works"""
    print("Testing user authentication directly...")
    
    # Create a database session
    db = SessionLocal()
    
    try:
        # Test credentials
        email = "test@example.com"
        password = "password123"
        
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"ERROR: User with email {email} not found in database!")
            return False
            
        print(f"Found user: {user.email} (ID: {user.id})")
        print(f"User is_active: {user.is_active}")
        print(f"User hashed_password: {user.hashed_password[:20]}...")
        
        # Test password verification
        is_password_correct = verify_password(password, user.hashed_password)
        print(f"Password verification result: {is_password_correct}")
        
        return is_password_correct
    except Exception as e:
        print(f"Error testing authentication: {str(e)}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = test_user_auth()
    sys.exit(0 if success else 1) 