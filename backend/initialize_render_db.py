"""
Database initialization script for Render deployment.
This script should be run manually after deployment to initialize the database with test data.
"""
import os
import sys
from app.core.database import init_db
from app.core.config import settings
from app.models.user import User
from app.core.security import get_password_hash
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.category import Category

def initialize_database():
    """Initialize the database with necessary tables and test data."""
    print("\n===== INITIALIZING DATABASE =====")
    print(f"USE_SQLITE: {settings.USE_SQLITE}")
    print(f"DATABASE_URL: {settings.DATABASE_URL}")
    
    # Initialize database tables
    init_db()
    
    # Create a test user if it doesn't exist
    db = SessionLocal()
    try:
        # Check if test user already exists
        test_user = db.query(User).filter(User.email == "test@example.com").first()
        if not test_user:
            # Create test user
            print("Creating test user...")
            user = User(
                email="test@example.com",
                hashed_password=get_password_hash("password123"),
                is_active=True,
                is_admin=False,
                first_name="Test",
                last_name="User",
                preferred_currency="USD"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print("Test user created successfully!")
            print("Login credentials: test@example.com / password123")
            
            # Now create default categories for the test user
            create_default_categories(db, user.id)
        else:
            print("Test user already exists, checking for categories...")
            # Check if categories exist for the user
            categories = db.query(Category).filter(Category.user_id == test_user.id).all()
            if not categories:
                print("No categories found for test user, creating defaults...")
                create_default_categories(db, test_user.id)
            else:
                print(f"Found {len(categories)} existing categories for test user.")
                
        print("Database initialization complete!")
        return True
    except Exception as e:
        print(f"Error initializing database: {str(e)}")
        return False
    finally:
        db.close()

def create_default_categories(db: Session, user_id: int):
    """Create default categories for a user."""
    default_categories = [
        {"name": "Groceries", "color": "#4CAF50", "description": "Food and household items"},
        {"name": "Dining", "color": "#FF9800", "description": "Restaurants and takeout"},
        {"name": "Transportation", "color": "#2196F3", "description": "Public transit, fuel, and ride services"},
        {"name": "Housing", "color": "#9C27B0", "description": "Rent, mortgage, and utilities"},
        {"name": "Entertainment", "color": "#E91E63", "description": "Movies, games, and hobbies"},
        {"name": "Health", "color": "#00BCD4", "description": "Medical expenses and fitness"},
        {"name": "Shopping", "color": "#795548", "description": "Clothing and retail purchases"},
        {"name": "Travel", "color": "#607D8B", "description": "Vacations and trips"},
        {"name": "Education", "color": "#FF5722", "description": "Courses, books, and supplies"},
        {"name": "Other", "color": "#9E9E9E", "description": "Miscellaneous expenses"},
    ]
    
    print(f"Creating {len(default_categories)} default categories...")
    for cat_data in default_categories:
        category = Category(
            **cat_data,
            user_id=user_id,
        )
        db.add(category)
    
    db.commit()
    print("Default categories created successfully!")

if __name__ == "__main__":
    success = initialize_database()
    sys.exit(0 if success else 1) 