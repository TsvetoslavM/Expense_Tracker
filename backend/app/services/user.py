from typing import Optional
from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """
    Get a user by ID.
    
    Args:
        db: Database session
        user_id: User ID
        
    Returns:
        User object or None if not found
    """
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Get a user by email.
    
    Args:
        db: Database session
        email: User email
        
    Returns:
        User object or None if not found
    """
    return db.query(User).filter(User.email == email).first()


def update_user_last_login(db: Session, user_id: int) -> bool:
    """
    Update the last_login timestamp for a user.
    
    Args:
        db: Database session
        user_id: User ID
        
    Returns:
        True if successful, False otherwise
    """
    from datetime import datetime
    
    user = get_user_by_id(db, user_id)
    if not user:
        return False
    
    user.last_login = datetime.utcnow()
    db.commit()
    return True 