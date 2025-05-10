from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# Shared properties
class UserBase(BaseModel):
    """
    Base shared user properties.
    """
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: Optional[bool] = True
    is_admin: bool = False
    preferred_currency: Optional[str] = "USD"


# Properties to receive on user creation
class UserCreate(UserBase):
    """
    Properties to receive via API on creation.
    """
    email: EmailStr
    password: str = Field(..., min_length=8)


# Properties to receive on user update
class UserUpdate(UserBase):
    """
    Properties to receive via API on update.
    """
    password: Optional[str] = Field(None, min_length=8)


# Properties shared by models stored in DB
class UserInDBBase(UserBase):
    """
    Base class for all user models that are stored in DB.
    """
    id: int
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


# Properties to return to client
class User(UserInDBBase):
    """
    Properties to return to client.
    """
    pass


# Properties stored in DB
class UserInDB(UserInDBBase):
    """
    Properties stored in DB.
    """
    hashed_password: str 