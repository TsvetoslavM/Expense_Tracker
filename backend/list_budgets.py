from app.core.database import SessionLocal
from app.models.budget import Budget
from sqlalchemy import text

def list_budgets():
    """List all budgets in the database"""
    db = SessionLocal()
    try:
        print("Checking if budgets table exists...")
        result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='budgets'"))
        table_exists = result.fetchone() is not None
        
        if not table_exists:
            print("Error: The budgets table does not exist!")
            return
            
        print("Getting table schema...")
        result = db.execute(text("PRAGMA table_info(budgets)"))
        columns = result.fetchall()
        print(f"Budgets table has {len(columns)} columns:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
            
        # Check if there are any records in the table
        print("\nQuerying database for all budgets...")
        try:
            # Get a total count
            result = db.execute(text("SELECT COUNT(*) FROM budgets"))
            count = result.fetchone()[0]
            print(f"Raw SQL count: {count} budget records")
            
            # Show all budget records
            print("All budget records:")
            result = db.execute(text("SELECT id, amount, year, month, period, currency, category_id, user_id FROM budgets"))
            budgets = result.fetchall()
            for budget in budgets:
                print(f"  - ID: {budget[0]}, Amount: {budget[1]}, Year: {budget[2]}, Month: {budget[3]}, " +
                      f"Period: {budget[4]}, Currency: {budget[5]}, Category: {budget[6]}, User: {budget[7]}")
                
        except Exception as sql_error:
            print(f"SQL Error: {str(sql_error)}")
        
        # Query with ORM
        print("\nQuerying with SQLAlchemy ORM...")
        budgets = db.query(Budget).all()
        print(f"ORM Query: Found {len(budgets)} budgets:")
        
        for b in budgets:
            print(f"ID: {b.id}, Year: {b.year}, Month: {b.month}, Amount: {b.amount}, Category: {b.category_id}")
            
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    list_budgets() 