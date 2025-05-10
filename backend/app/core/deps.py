from typing import Generator, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_password
from app.models.user import User
from app.schemas.token import TokenPayload

# OAuth2 password bearer for token authentication
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"/api/auth/login/json"
)

# Dependency to get the current user from a token
def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    Get the current user from the provided JWT token.
    
    Args:
        db: Database session.
        token: JWT token.
        
    Returns:
        The current user.
        
    Raises:
        HTTPException: If the token is invalid or the user doesn't exist.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.id == token_data.sub).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

# Dependency to get the current active user
def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get the current active user.
    
    Args:
        current_user: The current user from the JWT token.
        
    Returns:
        The current active user.
        
    Raises:
        HTTPException: If the user is inactive.
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return current_user

# Dependency to check if the current user is an admin
def get_current_admin_user(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Get the current admin user.
    
    Args:
        current_user: The current active user.
        
    Returns:
        The current admin user.
        
    Raises:
        HTTPException: If the user is not an admin.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return current_user

# Function to authenticate a user with email and password
def authenticate_user(
    db: Session, email: str, password: str
) -> Optional[User]:
    """
    Authenticate a user with email and password.
    
    Args:
        db: Database session.
        email: User email.
        password: User password.
        
    Returns:
        The authenticated user if successful, None otherwise.
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    
    return user 