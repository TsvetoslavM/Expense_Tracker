from pydantic import BaseModel, EmailStr, Field


class PasswordResetRequest(BaseModel):
    """
    Schema for password reset request.
    """
    email: EmailStr


class PasswordReset(BaseModel):
    """
    Schema for password reset completion.
    """
    token: str
    password: str = Field(..., min_length=8)


class PasswordResetResponse(BaseModel):
    """
    Schema for password reset response.
    """
    message: str 