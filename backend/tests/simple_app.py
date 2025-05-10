"""
A simplified FastAPI app for testing API compatibility with Python 3.13.
This module provides basic endpoints that mimic the main app's behavior
without complex dependencies that might cause issues with Python 3.13.
"""

import os
import sys
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

# JWT libraries
try:
    import jwt
except ImportError:
    try:
        import jose.jwt as jwt
    except ImportError:
        print("Error: Neither PyJWT nor python-jose is installed.")
        print("Install with: pip install PyJWT")
        sys.exit(1)

# Create the app
app = FastAPI(
    title="Expense Tracker API (Test Version)",
    description="Simplified API for testing compatibility",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Basic configurations - use environment variables if available, otherwise use defaults
SECRET_KEY = os.getenv("SECRET_KEY", "test-secret-key-for-compatibility-testing")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Mock user database (in-memory)
USERS_DB = {
    "test@example.com": {
        "email": "test@example.com",
        "hashed_password": "$2b$12$sAXVPqKrd2YnkAIw4iOD3.bESWmfX8GhZb5Fo6IJTOp.ERIaDr12K", # Password: testpassword
        "full_name": "Test User",
        "is_active": True,
    }
}

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Helper functions

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    A simple password verification function.
    For testing purposes, we'll accept "testpassword" for the test user.
    """
    return plain_password == "testpassword"

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    
    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    # Create JWT token
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user(email: str):
    """Retrieve a user from the mock database."""
    if email in USERS_DB:
        return USERS_DB[email]
    return None

def authenticate_user(email: str, password: str):
    """Authenticate a user with email and password."""
    user = get_user(email)
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user

# Endpoint definitions

@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "test"}

@app.post("/api/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login endpoint that returns a JWT token."""
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/register")
def register(email: str, password: str, full_name: Optional[str] = None):
    """Register a new user."""
    if email in USERS_DB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # In a real implementation, we would hash the password
    # For testing, we'll accept it as is
    USERS_DB[email] = {
        "email": email,
        "hashed_password": password,  # Not hashed for simplicity
        "full_name": full_name,
        "is_active": True
    }
    
    return {"email": email, "message": "User registered successfully"}

@app.get("/api/users/me")
def read_users_me(token: str = Depends(oauth2_scheme)):
    """Get current user information."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = get_user(email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "email": user["email"],
        "full_name": user["full_name"],
        "is_active": user["is_active"]
    } 