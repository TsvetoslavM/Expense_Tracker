from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import sys

from app.core.config import settings

# Flag to track if we're in test mode
IS_TESTING = 'pytest' in sys.modules or 'sqlite' in str(settings.DATABASE_URL).lower()

# Create database engine based on URL
if IS_TESTING or 'sqlite' in str(settings.DATABASE_URL).lower():
    print(f"Using SQLite database at: {settings.DATABASE_URL}")
    # For SQLite, enforce absolute path to avoid multiple database files
    if 'sqlite:///' in str(settings.DATABASE_URL).lower():
        # Convert to absolute path if it's not already
        import os
        db_path = settings.DATABASE_URL.replace('sqlite:///','')
        if db_path.startswith('./'):
            db_path = db_path[2:]  # Remove the ./ prefix
        absolute_path = os.path.abspath(db_path)
        # Create absolute database URL
        absolute_db_url = f"sqlite:///{absolute_path}"
        print(f"Converting relative path to absolute: {absolute_db_url}")
        connect_args = {"check_same_thread": False}
        engine = create_engine(
            absolute_db_url, connect_args=connect_args
        )
    else:
        connect_args = {"check_same_thread": False} if 'sqlite' in str(settings.DATABASE_URL).lower() else {}
        engine = create_engine(
            settings.DATABASE_URL, connect_args=connect_args
        )
else:
    print(f"Using PostgreSQL database at: {settings.DATABASE_URL}")
    engine = create_engine(
        settings.DATABASE_URL
    )

# Create a SessionLocal class that will be used to create a session/connection to the database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a Base class that will be used to create each of the database models or classes (the ORM models)
Base = declarative_base()


# Dependency function to get DB session
def get_db():
    """
    Dependency function that yields database sessions.
    Used for dependency injection in path operation functions.
    Ensures that the database session is closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize the database by creating all tables if they don't exist.
    This is called when the application starts.
    """
    # Import all the models here so that they are registered with SQLAlchemy Base
    # This import is here to avoid circular imports
    from app.models import user, expense, category, budget
    
    # Create tables
    print(f"Creating database tables (if they don't exist) using engine: {engine}")
    Base.metadata.create_all(bind=engine) 