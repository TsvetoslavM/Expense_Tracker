from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_active_user, get_current_admin_user
from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.user import User as UserSchema, UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserSchema)
def get_current_user_info(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get current user information.
    """
    return current_user


@router.put("/me", response_model=UserSchema)
def update_current_user(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update current user information.
    """
    # Update user attributes
    for key, value in user_in.dict(exclude_unset=True).items():
        if key == "password" and value:
            setattr(current_user, "hashed_password", get_password_hash(value))
        elif hasattr(current_user, key) and key != "is_admin":  # Prevent changing admin status
            setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user


# Admin endpoints for user management
@router.get("/", response_model=List[UserSchema])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),  # Only admin can access
) -> Any:
    """
    Get all users (admin only).
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/{user_id}", response_model=UserSchema)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),  # Only admin can access
) -> Any:
    """
    Get user by ID (admin only).
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@router.put("/{user_id}", response_model=UserSchema)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),  # Only admin can access
) -> Any:
    """
    Update user by ID (admin only).
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Update user attributes
    for key, value in user_in.dict(exclude_unset=True).items():
        if key == "password" and value:
            setattr(user, "hashed_password", get_password_hash(value))
        elif hasattr(user, key):
            setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", response_model=UserSchema)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),  # Only admin can access
) -> Any:
    """
    Delete user by ID (admin only).
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Prevent deleting your own account
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account",
        )
    
    db.delete(user)
    db.commit()
    return user 