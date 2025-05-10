from typing import Optional
from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    """
    Schema for access token response.
    """
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    """
    Schema for JWT token payload.
    """
    sub: Optional[str] = None


class LoginRequest(BaseModel):
    """
    Schema for login request.
    """
    email: EmailStr
    password: str 