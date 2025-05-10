from app.core.database import SessionLocal, init_db
from app.models.category import Category
from sqlalchemy import text

def create_default_categories():
    """Create default categories in the database"""
    print("Initializing database...")
    init_db()
    db = SessionLocal()
    
    try:
        # Check if categories table exists
        print("Checking if categories table exists...")
        result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='categories'"))
        if not result.fetchone():
            print("Categories table doesn't exist! Creating it...")
            db.execute(text("""
                CREATE TABLE IF NOT EXISTS categories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR NOT NULL,
                    description VARCHAR,
                    color VARCHAR DEFAULT '#3B82F6',
                    icon VARCHAR,
                    user_id INTEGER NOT NULL,
                    created_at TIMESTAMP,
                    updated_at TIMESTAMP,
                    FOREIGN KEY(user_id) REFERENCES users(id)
                )
            """))
            db.commit()
        
        # Check if we already have categories
        print("Checking for existing categories...")
        result = db.execute(text("SELECT COUNT(*) FROM categories"))
        count = result.fetchone()[0]
        
        if count > 0:
            print(f"Found {count} existing categories, showing sample:")
            result = db.execute(text("SELECT id, name, color, user_id FROM categories LIMIT 5"))
            for cat in result.fetchall():
                print(f"  - ID: {cat[0]}, Name: {cat[1]}, Color: {cat[2]}, User: {cat[3]}")
        else:
            print("No categories found, creating defaults...")
            
            # Define default categories
            default_categories = [
                {"name": "Food", "color": "#00C49F", "description": "Groceries and dining out"},
                {"name": "Transportation", "color": "#FFBB28", "description": "Gas, public transit, car maintenance"},
                {"name": "Housing", "color": "#0088FE", "description": "Rent, mortgage, utilities"},
                {"name": "Entertainment", "color": "#FF8042", "description": "Movies, games, hobbies"},
                {"name": "Shopping", "color": "#FF8042", "description": "Clothing, electronics, personal items"},
                {"name": "Education", "color": "#8884D8", "description": "Tuition, books, courses"},
                {"name": "Health", "color": "#0088FE", "description": "Medical expenses, fitness"}
            ]
            
            # Create categories with direct SQL for reliability
            for cat in default_categories:
                db.execute(text("""
                    INSERT INTO categories (name, description, color, user_id, created_at, updated_at)
                    VALUES (:name, :description, :color, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """), cat)
            
            db.commit()
            print("Default categories created successfully")
            
            # Verify categories were created
            result = db.execute(text("SELECT id, name, color FROM categories"))
            cats = result.fetchall()
            print(f"Created {len(cats)} categories:")
            for cat in cats:
                print(f"  - ID: {cat[0]}, Name: {cat[1]}, Color: {cat[2]}")
        
        return True
    except Exception as e:
        print(f"Error: {str(e)}")
        db.rollback()
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = create_default_categories()
    print(f"Category creation {'succeeded' if success else 'failed'}") 
 