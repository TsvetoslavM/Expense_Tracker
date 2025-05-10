from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.category import Category


# Shared properties
class ExpenseBase(BaseModel):
    """
    Base shared expense properties.
    """
    amount: Optional[float] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    currency: Optional[str] = "USD"
    notes: Optional[str] = None
    attachment_url: Optional[str] = None
    category_id: Optional[int] = None


# Properties to receive on expense creation
class ExpenseCreate(ExpenseBase):
    """
    Properties to receive via API on creation.
    """
    amount: float = Field(..., gt=0)  # Must be greater than 0
    date: datetime
    category_id: int


# Properties to receive on expense update
class ExpenseUpdate(ExpenseBase):
    """
    Properties to receive via API on update.
    """
    pass


# Properties shared by models stored in DB
class ExpenseInDBBase(ExpenseBase):
    """
    Base class for all expense models that are stored in DB.
    """
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Properties to return to client
class Expense(ExpenseInDBBase):
    """
    Properties to return to client.
    """
    pass


# Properties with expanded category to return to client
class ExpenseWithCategory(Expense):
    """
    Expense with category details included.
    """
    category: Category


# Properties stored in DB
class ExpenseInDB(ExpenseInDBBase):
    """
    Properties stored in DB.
    """
    pass 