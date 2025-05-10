from app.core.database import SessionLocal, init_db
from app.models.budget import Budget
from app.models.category import Category
from sqlalchemy import text

def reset_and_fix_budget_database():
    """
    Reset and fix the budget database to ensure it's working properly
    """
    print("Initializing database...")
    init_db()
    db = SessionLocal()
    
    try:
        # First, check if we have at least one category
        print("Checking for categories with ORM...")
        categories = db.query(Category).all()
        if not categories:
            print("No categories found with ORM query, trying direct SQL...")
            result = db.execute(text("SELECT id, name FROM categories LIMIT 5"))
            sql_categories = result.fetchall()
            
            if not sql_categories:
                print("Error: No categories found in database! Please create categories first.")
                return False
                
            print(f"Found {len(sql_categories)} categories with SQL:")
            for cat in sql_categories:
                print(f"  - ID: {cat[0]}, Name: {cat[1]}")
                
            category_id = sql_categories[0][0]
        else:
            print(f"Found {len(categories)} categories with ORM:")
            for cat in categories:
                print(f"  - ID: {cat.id}, Name: {cat.name}")
                
            category_id = categories[0].id
            
        print(f"Using category ID: {category_id}")
        
        # Clear existing budgets
        print("Clearing existing budgets...")
        db.execute(text("DELETE FROM budgets"))
        db.commit()
        print("All existing budgets deleted")
        
        # Create sample budgets directly with SQL for reliability
        print("Creating sample budgets with SQL...")
        
        # Monthly budget
        db.execute(text("""
            INSERT INTO budgets (amount, year, month, period, currency, category_id, user_id, created_at, updated_at)
            VALUES (750.0, 2025, 5, 'monthly', 'USD', :category_id, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """), {'category_id': category_id})
        
        # Yearly budget
        db.execute(text("""
            INSERT INTO budgets (amount, year, month, period, currency, category_id, user_id, created_at, updated_at)
            VALUES (9000.0, 2025, NULL, 'yearly', 'USD', :category_id, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """), {'category_id': category_id})
        
        db.commit()
        print("Sample budgets created with SQL")
        
        # Verify budgets were created with SQL
        print("Verifying budgets with SQL...")
        result = db.execute(text("SELECT id, amount, year, month, period, category_id FROM budgets"))
        sql_budgets = result.fetchall()
        print(f"Found {len(sql_budgets)} budgets with SQL:")
        for b in sql_budgets:
            print(f"  - ID: {b[0]}, Year: {b[2]}, Month: {b[3]}, Period: {b[4]}, Amount: {b[1]}, Category: {b[5]}")
        
        # Verify with ORM too
        print("\nVerifying budgets with ORM...")
        budgets = db.query(Budget).all()
        print(f"Found {len(budgets)} budgets with ORM:")
        for b in budgets:
            print(f"  - ID: {b.id}, Year: {b.year}, Month: {b.month}, Period: {b.period}, Amount: {b.amount}, Category: {b.category_id}")
            
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
    success = reset_and_fix_budget_database()
    print(f"Budget database fix {'succeeded' if success else 'failed'}") 