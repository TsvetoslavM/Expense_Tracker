from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from datetime import datetime
from typing import Optional

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.services import user as user_service
from app.core.security import verify_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    """
    Get the current user from the token.
    
    Args:
        token: JWT token
        db: Database session
        
    Returns:
        User model
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify token and extract payload
        payload = verify_token(token)
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        # Get user from database
        user = user_service.get_user_by_id(db, user_id)
        if user is None:
            raise credentials_exception
            
        return user
    except JWTError:
        raise credentials_exception
    except Exception as e:
        print(f"Error in get_current_user: {str(e)}")
        raise credentials_exception


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Verify that the current user is active.
    
    Args:
        current_user: User model
        
    Returns:
        User model
        
    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    return current_user


async def get_current_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    """
    Verify that the current user is an admin.
    
    Args:
        current_user: User model
        
    Returns:
        User model
        
    Raises:
        HTTPException: If user is not an admin
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not enough permissions"
        )
    return current_user 