from app.core.database import Base, engine, SessionLocal, init_db
from app.models.budget import Budget
from sqlalchemy import text

def update_budget_table():
    """
    Update the budget table schema by dropping and recreating it.
    WARNING: This will delete all existing budgets!
    Use only in development environment.
    """
    print("Updating budget table schema to include 'year' field...")
    
    # Initialize database connection
    init_db()
    db = SessionLocal()
    
    try:
        # Recreate the budgets table with the correct schema
        # First, check if the table exists
        print("Checking if budgets table exists...")
        result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='budgets'"))
        table_exists = result.fetchone() is not None
        
        if table_exists:
            print("Dropping existing budgets table...")
            db.execute(text("DROP TABLE IF EXISTS budgets"))
            db.commit()
        
        print("Creating budgets table with updated schema...")
        db.execute(text("""
        CREATE TABLE budgets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount FLOAT NOT NULL,
            year INTEGER NOT NULL,
            month INTEGER,
            period VARCHAR,
            currency VARCHAR,
            category_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            created_at TIMESTAMP,
            updated_at TIMESTAMP,
            FOREIGN KEY(category_id) REFERENCES categories(id),
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
        """))
        db.commit()
        
        print("Budgets table updated successfully.")
        return True
    except Exception as e:
        print(f"Error updating budgets table: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = update_budget_table()
    print(f"Schema update {'succeeded' if success else 'failed'}")
    exit(0 if success else 1) 