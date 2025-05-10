import os
import sqlite3
from app.core.database import SessionLocal, init_db
from app.models.budget import Budget
import datetime

def check_file_exists(file_path):
    """Check if the database file exists and print its details"""
    if os.path.exists(file_path):
        size = os.path.getsize(file_path)
        modified = datetime.datetime.fromtimestamp(os.path.getmtime(file_path))
        print(f"✅ Database file exists: {file_path}")
        print(f"   - Size: {size} bytes")
        print(f"   - Last modified: {modified}")
        
        # Try to open the file
        try:
            with open(file_path, 'rb') as f:
                # Read first few bytes to verify it's accessible
                data = f.read(10)
                print(f"✅ File is accessible and readable")
        except Exception as e:
            print(f"❌ Error accessing file: {str(e)}")
    else:
        print(f"❌ Database file does not exist: {file_path}")
        parent_dir = os.path.dirname(file_path)
        if os.path.exists(parent_dir):
            print(f"   Parent directory exists: {parent_dir}")
            print(f"   Directory contents: {os.listdir(parent_dir)}")
        else:
            print(f"   Parent directory does not exist: {parent_dir}")

def test_direct_sqlite_connection():
    """Test direct connection to SQLite database"""
    print("\n=== Testing Direct SQLite Connection ===")
    
    # Check current directory
    cwd = os.getcwd()
    print(f"Current working directory: {cwd}")
    
    # Expected SQLite database path
    db_path = "./expense_tracker.db"
    abs_db_path = os.path.abspath(db_path)
    print(f"Absolute database path: {abs_db_path}")
    
    # Check if the file exists
    check_file_exists(abs_db_path)
    
    # Try to connect directly with SQLite
    try:
        print("\nAttempting direct SQLite connection...")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print(f"Tables in database: {[t[0] for t in tables]}")
        
        # Check budgets
        cursor.execute("SELECT COUNT(*) FROM budgets")
        count = cursor.fetchone()[0]
        print(f"Found {count} budgets in SQLite")
        
        # Try a direct insert
        print("\nAttempting direct SQLite insert...")
        now = datetime.datetime.utcnow().isoformat()
        cursor.execute("""
            INSERT INTO budgets (amount, year, month, period, currency, category_id, user_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (2000.0, 2031, 1, 'monthly', 'USD', 2, 1, now, now))
        
        # Commit the transaction
        conn.commit()
        print("✅ Direct SQLite insert successful")
        
        # Get the inserted ID
        cursor.execute("SELECT last_insert_rowid()")
        last_id = cursor.fetchone()[0]
        print(f"Inserted budget ID: {last_id}")
        
        # Verify the insert
        cursor.execute(f"SELECT * FROM budgets WHERE id = {last_id}")
        inserted_budget = cursor.fetchone()
        print(f"Inserted budget data: {inserted_budget}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ SQLite error: {str(e)}")
        if conn:
            conn.close()

def test_sqlalchemy_connection():
    """Test SQLAlchemy ORM connection to the database"""
    print("\n=== Testing SQLAlchemy ORM Connection ===")
    
    try:
        # Initialize the database if needed
        print("Initializing database...")
        init_db()
        
        # Create a new session
        print("Creating SQLAlchemy session...")
        db = SessionLocal()
        
        # Count budgets
        budget_count = db.query(Budget).count()
        print(f"Found {budget_count} budgets with ORM")
        
        # Try to create a budget with ORM
        print("\nAttempting to create budget with ORM...")
        new_budget = Budget(
            amount=2500.0,
            year=2032,
            month=2,
            period="monthly",
            currency="USD",
            category_id=2,
            user_id=1
        )
        
        # Add to database
        db.add(new_budget)
        
        # Attempt to commit
        print("Committing transaction...")
        db.commit()
        
        # Refresh to get the ID
        db.refresh(new_budget)
        print(f"✅ ORM insert successful with ID: {new_budget.id}")
        
        # Close session
        db.close()
        
    except Exception as e:
        print(f"❌ SQLAlchemy error: {str(e)}")
        import traceback
        traceback.print_exc()
        if 'db' in locals():
            db.rollback()
            db.close()

if __name__ == "__main__":
    # Run both tests
    test_direct_sqlite_connection()
    test_sqlalchemy_connection() 