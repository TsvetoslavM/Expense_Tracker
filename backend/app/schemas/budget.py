from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field, validator

from app.schemas.category import Category


# Shared properties
class BudgetBase(BaseModel):
    """
    Base shared budget properties.
    """
    amount: float = Field(..., gt=0, description="Budget amount must be greater than 0")
    year: int = Field(..., ge=2000, le=2100, description="Year for the budget")
    month: Optional[int] = Field(None, ge=1, le=12, description="Month for the budget (1-12)")
    period: Optional[str] = Field("monthly", description="Budget period (monthly, yearly, custom)")
    currency: Optional[str] = Field("USD", description="Currency code")
    category_id: int = Field(..., description="Category ID this budget applies to")


# Properties to receive on budget creation
class BudgetCreate(BudgetBase):
    """
    Properties to receive via API on creation.
    """
    pass


# Properties to receive on budget update
class BudgetUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    year: Optional[int] = Field(None, ge=2000, le=2100)
    month: Optional[int] = Field(None, ge=1, le=12)
    period: Optional[str] = None
    currency: Optional[str] = None
    category_id: Optional[int] = None


# Properties shared by models stored in DB
class BudgetInDBBase(BudgetBase):
    """
    Base class for all budget models that are stored in DB.
    """
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Properties to return to client
class Budget(BudgetInDBBase):
    """
    Properties to return to client.
    """
    pass


# Properties with expanded category to return to client
class BudgetWithCategory(Budget):
    """
    Budget with category details included.
    """
    category: Category


# Properties with spending data to return to client
class BudgetWithSpending(Budget):
    """
    Budget with current spending data.
    """
    spent_amount: float
    remaining_amount: float
    percentage_used: float


# Properties stored in DB
class BudgetInDB(BudgetInDBBase):
    """
    Properties stored in DB.
    """
    pass


# Aggregate budget data with category info and spending stats
class BudgetWithStats(Budget):
    category_name: str
    category_color: str
    spent_amount: float
    remaining_amount: float
    percentage_used: float


# Budget list response
class BudgetListResponse(BaseModel):
    total: int
    skip: int
    limit: int
    data: List[Budget] 