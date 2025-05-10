from app.core.database import SessionLocal, init_db
from app.models.user import User
from app.core.security import get_password_hash
from sqlalchemy import text

def create_test_user():
    # Initialize the database if needed
    init_db()
    
    # Create a database session
    db = SessionLocal()
    
    try:
        # Check if database is accessible
        db.execute(text("SELECT 1"))
        print("Database connection successful")
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == "test@example.com").first()
        if existing_user:
            print(f"Test user already exists with ID: {existing_user.id}")
            return
        
        # Create new test user
        user = User(
            email="test@example.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            is_admin=False,
            first_name="Test",
            last_name="User",
            preferred_currency="USD"
        )
        
        # Add to database
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print(f"Test user created successfully with ID: {user.id}")
        print("Login credentials:")
        print("Email: test@example.com")
        print("Password: password123")
        
    except Exception as e:
        print(f"Error creating test user: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user() 