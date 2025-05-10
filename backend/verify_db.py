"""
Database verification script.
Run this on Render to verify the database configuration.
"""
import os
import sys
from sqlalchemy import text
from app.core.config import settings
from app.core.database import engine, SessionLocal

def verify_database():
    """Verify database connection and print diagnostic information."""
    print("\n===== DATABASE VERIFICATION =====")
    print(f"USE_SQLITE: {settings.USE_SQLITE}")
    print(f"DATABASE_URL: {settings.DATABASE_URL}")
    
    # Check if we can connect to the database
    try:
        # Create a connection
        conn = engine.connect()
        print("✅ Connected to database successfully!")
        
        # Execute a simple query
        result = conn.execute(text("SELECT 1"))
        print(f"✅ Query executed successfully: {result.scalar()}")
        
        # Close the connection
        conn.close()
        
        # Test session creation
        db = SessionLocal()
        print("✅ Session created successfully!")
        db.close()
        
        return True
    except Exception as e:
        print(f"❌ Database connection error: {str(e)}")
        print(f"Database engine URL: {engine.url}")
        
        # Print more information about the environment
        print("\nEnvironment variables:")
        for key, value in os.environ.items():
            if "DATABASE" in key or "POSTGRES" in key or "SQLITE" in key:
                # Mask passwords in connection strings
                if "PASSWORD" in key or "URL" in key and "://" in str(value):
                    parts = str(value).split("@")
                    if len(parts) > 1:
                        credentials = parts[0].split("://")
                        if len(credentials) > 1:
                            masked = f"{credentials[0]}://****@{parts[1]}"
                            print(f"  {key}={masked}")
                        else:
                            print(f"  {key}=****")
                    else:
                        print(f"  {key}=****")
                else:
                    print(f"  {key}={value}")
        
        return False

if __name__ == "__main__":
    success = verify_database()
    sys.exit(0 if success else 1) 