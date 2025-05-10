from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import EmailStr

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import authenticate_user
from app.core.security import create_access_token, get_password_hash
from app.models.user import User
from app.schemas.token import Token, LoginRequest
from app.schemas.user import UserCreate, User as UserSchema
from app.schemas.password import PasswordResetRequest, PasswordReset, PasswordResetResponse
from app.services.email import generate_password_reset_token, verify_password_reset_token, send_password_reset_email

router = APIRouter()


@router.post("/auth/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login time
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            subject=user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }


@router.post("/auth/login/json", response_model=Token)
def login_json(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
) -> Any:
    """
    JSON compatible login, get an access token for future requests.
    """
    try:
        # Print login attempt for debugging
        print(f"Login attempt with email: {login_data.email}")
        
        # First check if user exists
        user_exists = db.query(User).filter(User.email == login_data.email).first()
        if not user_exists:
            print(f"User not found: {login_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )
            
        # Then try to authenticate
        user = authenticate_user(db, login_data.email, login_data.password)
        if not user:
            print(f"Authentication failed for user: {login_data.email} - Invalid password")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )
        elif not user.is_active:
            print(f"Inactive user attempted login: {login_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Inactive user",
            )
        
        # Update last login time - using datetime directly to avoid SQL issues
        print(f"User authenticated successfully: {login_data.email}")
        user.last_login = datetime.utcnow()
        
        try:
            db.commit()
            print(f"Last login timestamp updated for user: {login_data.email}")
        except Exception as db_error:
            print(f"Error updating last login timestamp: {str(db_error)}")
            db.rollback()
            # Continue anyway - this is not critical
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        token = create_access_token(
            subject=user.id, expires_delta=access_token_expires
        )
        print(f"Access token created for user: {login_data.email}")
        
        # Return token response
        token_response = {
            "access_token": token,
            "token_type": "bearer",
        }
        print(f"Login successful for: {login_data.email}")
        return token_response
        
    except HTTPException as he:
        # Re-raise HTTP exceptions with proper status codes
        print(f"HTTP exception during login: {str(he)}")
        raise
    except Exception as e:
        # Log any errors
        print(f"Unexpected login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login error: {str(e)}",
        )


@router.post("/auth/register", response_model=UserSchema)
def register_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
) -> Any:
    """
    Register a new user.
    """
    # Check if user with this email already exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create new user
    db_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        is_active=True,
        is_admin=False,
        preferred_currency=user_in.preferred_currency,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # TODO: Send welcome email (would be implemented in services.email)
    
    return db_user


@router.post("/auth/password-reset/request", response_model=PasswordResetResponse)
async def request_password_reset(
    password_reset: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> Any:
    """
    Request a password reset.
    """
    user = db.query(User).filter(User.email == password_reset.email).first()
    
    # Always return a success message even if the user doesn't exist
    # This prevents user enumeration attacks
    if user and user.is_active:
        token = generate_password_reset_token(password_reset.email)
        await send_password_reset_email(
            background_tasks=background_tasks,
            email_to=password_reset.email,
            token=token,
        )
    
    return {"message": "If your email is registered, you will receive a password reset link shortly."}


@router.post("/auth/password-reset/confirm", response_model=PasswordResetResponse)
def confirm_password_reset(
    password_reset: PasswordReset,
    db: Session = Depends(get_db),
) -> Any:
    """
    Reset password using a token.
    """
    email = verify_password_reset_token(password_reset.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token",
        )
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    
    # Update password
    user.hashed_password = get_password_hash(password_reset.password)
    db.commit()
    
    return {"message": "Password has been reset successfully."} 