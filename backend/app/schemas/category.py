from datetime import datetime
from typing import Optional

from pydantic import BaseModel


# Shared properties
class CategoryBase(BaseModel):
    """
    Base shared category properties.
    """
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = "#3498db"  # Default blue color
    icon: Optional[str] = "tag"       # Default icon


# Properties to receive on category creation
class CategoryCreate(CategoryBase):
    """
    Properties to receive via API on creation.
    """
    name: str


# Properties to receive on category update
class CategoryUpdate(CategoryBase):
    """
    Properties to receive via API on update.
    """
    pass


# Properties shared by models stored in DB
class CategoryInDBBase(CategoryBase):
    """
    Base class for all category models that are stored in DB.
    """
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Properties to return to client
class Category(CategoryInDBBase):
    """
    Properties to return to client.
    """
    pass


# Properties stored in DB
class CategoryInDB(CategoryInDBBase):
    """
    Properties stored in DB.
    """
    pass 