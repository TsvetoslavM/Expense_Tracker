"""
Simple script to test module imports in isolation
"""
import traceback

try:
    print("Checking imports...")
    from sqlalchemy import text
    print("✅ sqlalchemy.text imported successfully")
    
    import app.services.budget as budget_service
    print("✅ budget_service imported successfully")
    
    # Test the basic functionality
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker, Session
    
    # Create a test engine and session
    print("Creating test engine...")
    engine = create_engine("sqlite:///./test.db")
    Session = sessionmaker(bind=engine)
    db = Session()
    
    print("Testing budget_service.get_budgets...")
    try:
        budgets = budget_service.get_budgets(
            db=db,
            user_id=1,
            year=None,
            month=None,
            category_id=None,
            skip=0,
            limit=100
        )
        print(f"✅ get_budgets returned {len(budgets)} budgets")
    except Exception as e:
        print(f"❌ Error in get_budgets: {str(e)}")
        traceback.print_exc()
    
    # Close the session
    db.close()
    
except Exception as e:
    print(f"❌ Import error: {str(e)}")
    traceback.print_exc()

print("Import test completed") 