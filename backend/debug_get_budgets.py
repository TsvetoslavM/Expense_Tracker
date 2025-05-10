import sqlite3
import traceback
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

# Use test.db since that's what the API is using
DB_FILE = "./test.db"

def main():
    """Debug script to directly test the get_budgets functionality"""
    print("===== DEBUG GET_BUDGETS SCRIPT =====")
    print(f"Using database file: {DB_FILE}")
    
    # Check if database exists
    try:
        import os
        if os.path.exists(DB_FILE):
            print(f"✅ Database file exists: {DB_FILE}")
            print(f"File size: {os.path.getsize(DB_FILE) / 1024:.2f} KB")
        else:
            print(f"❌ Database file does not exist: {DB_FILE}")
            # List all db files in current directory
            db_files = [f for f in os.listdir('.') if f.endswith('.db')]
            print(f"Available .db files: {db_files}")
            if db_files:
                DB_FILE = db_files[0]  # Use the first available db file
                print(f"Using alternative database: {DB_FILE}")
    except Exception as e:
        print(f"Error checking database file: {str(e)}")
        traceback.print_exc()
    
    # Test with direct SQLite
    print("\n1. QUERYING WITH DIRECT SQLITE")
    try:
        sqlite_budgets = get_budgets_sqlite()
        print(f"Got {len(sqlite_budgets)} budgets from SQLite")
    except Exception as e:
        print(f"Error in SQLite section: {str(e)}")
        traceback.print_exc()
        sqlite_budgets = []
    
    # Test with SQLAlchemy
    print("\n2. QUERYING WITH SQLALCHEMY")
    try:
        sqlalchemy_budgets = get_budgets_sqlalchemy()
        print(f"Got {len(sqlalchemy_budgets)} budgets from SQLAlchemy")
    except Exception as e:
        print(f"Error in SQLAlchemy section: {str(e)}")
        traceback.print_exc()
        sqlalchemy_budgets = []
    
    print("\n===== SUMMARY =====")
    print(f"Budgets found with SQLite: {len(sqlite_budgets)}")
    print(f"Budgets found with SQLAlchemy: {len(sqlalchemy_budgets)}")
    
    return True

def get_budgets_sqlite():
    """Get budgets using direct SQLite connection"""
    print("Starting SQLite query...")
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # Check if budgets table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='budgets'")
        if not cursor.fetchone():
            print("❌ 'budgets' table does not exist in the database")
            # List all tables
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = cursor.fetchall()
            print(f"Available tables: {[t[0] for t in tables]}")
            return []
        
        # Check table structure
        cursor.execute("PRAGMA table_info(budgets)")
        columns = cursor.fetchall()
        print(f"Table columns: {[c[1] for c in columns]}")
        
        # Query all budgets for user_id 1
        print("Executing query...")
        cursor.execute("""
            SELECT id, amount, year, month, period, currency, category_id, user_id 
            FROM budgets 
            WHERE user_id = 1
            ORDER BY year DESC, month DESC
            LIMIT 100
        """)
        
        budgets = cursor.fetchall()
        
        print(f"Found {len(budgets)} budgets with SQLite")
        if budgets:
            print("Sample budgets:")
            for i, budget in enumerate(budgets[:5]):
                print(f"  Budget {i+1}: ID={budget[0]}, Amount={budget[1]} {budget[5]}, "
                      f"Period={budget[4]} ({budget[2]}-{budget[3] or 'N/A'}), Category={budget[6]}")
        
        conn.close()
        return budgets
    except Exception as e:
        print(f"❌ Error querying budgets with SQLite: {str(e)}")
        traceback.print_exc()
        return []

def get_budgets_sqlalchemy():
    """Get budgets using SQLAlchemy"""
    print("Starting SQLAlchemy query...")
    try:
        # Create engine and session
        print(f"Creating engine with: sqlite:///{DB_FILE}")
        engine = create_engine(f"sqlite:///{DB_FILE}")
        session = Session(engine)
        
        # Check if the engine can connect to the database
        try:
            session.execute(text("SELECT 1"))
            print("✅ SQLAlchemy connection successful")
        except Exception as e:
            print(f"❌ SQLAlchemy connection failed: {str(e)}")
            traceback.print_exc()
            return []
        
        # Query using SQLAlchemy's text function
        print("Executing query...")
        result = session.execute(text("""
            SELECT id, amount, year, month, period, currency, category_id, user_id 
            FROM budgets 
            WHERE user_id = 1
            ORDER BY year DESC, month DESC
            LIMIT 100
        """))
        
        # Convert result to list
        budgets = result.fetchall()
        
        print(f"Found {len(budgets)} budgets with SQLAlchemy")
        if budgets:
            print("Sample budgets:")
            for i, budget in enumerate(budgets[:5]):
                print(f"  Budget {i+1}: ID={budget[0]}, Amount={budget[1]} {budget[5]}, "
                      f"Period={budget[4]} ({budget[2]}-{budget[3] or 'N/A'}), Category={budget[6]}")
        
        session.close()
        return budgets
    except Exception as e:
        print(f"❌ Error querying budgets with SQLAlchemy: {str(e)}")
        traceback.print_exc()
        return []

if __name__ == "__main__":
    main() 