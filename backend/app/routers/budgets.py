from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
import traceback
import sys
from sqlalchemy.sql import text

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.schemas.budget import (
    Budget,
    BudgetCreate,
    BudgetUpdate,
    BudgetWithCategory,
    BudgetWithStats,
)
import app.services.budget as budget_service

router = APIRouter()


@router.get("/test", response_model=dict)
def test_budget_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Simple test endpoint to verify the budget router is working.
    """
    print("test_budget_endpoint called")
    try:
        # Try a direct database query
        result = db.execute(text("SELECT COUNT(*) FROM budgets WHERE user_id = :user_id"), 
                           {"user_id": current_user.id})
        count = result.scalar()
        
        # Return a simple response
        return {
            "status": "success",
            "message": "Budget test endpoint is working",
            "user_id": current_user.id,
            "budget_count": count
        }
    except Exception as e:
        print(f"Error in test endpoint: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Test endpoint error: {str(e)}"
        )


@router.get("/overview/current", response_model=List[dict])
def get_current_budgets_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get current budgets with spending statistics.
    """
    return budget_service.get_current_budgets(db=db, user_id=current_user.id)


@router.get("/stats", response_model=List[dict])
def get_budget_stats_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    year: int = Query(..., description="Year for budget stats"),
    month: Optional[int] = Query(None, description="Month for budget stats (1-12)"),
    category_id: Optional[int] = Query(None, description="Filter by category")
) -> Any:
    """
    Get budget statistics with spending information.
    """
    return budget_service.get_budgets_with_stats(
        db=db, 
        user_id=current_user.id, 
        year=year, 
        month=month, 
        category_id=category_id
    )


@router.get("/{budget_id}", response_model=Budget)
def get_budget_endpoint(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    budget_id: int,
) -> Any:
    """
    Get a specific budget by ID.
    """
    budget = budget_service.get_budget(db=db, budget_id=budget_id, user_id=current_user.id)
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found",
        )
    return budget


@router.get("/list", response_model=List[Budget])
def list_budgets_endpoint(
    year: Optional[int] = None,
    month: Optional[int] = None,
    category_id: Optional[int] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get all budgets for the current user with optional filtering.
    This is an alternative to the main route to avoid route conflicts.
    """
    print("----- list_budgets_endpoint called -----")
    print(f"User ID: {current_user.id}")
    print(f"Parameters: year={year}, month={month}, category_id={category_id}, skip={skip}, limit={limit}")
    sys.stdout.flush()  # Force output to show up immediately
    
    try:
        print("About to call budget_service.get_budgets")
        budgets = budget_service.get_budgets(
            db=db, 
            user_id=current_user.id,
            year=year,
            month=month,
            category_id=category_id,
            skip=skip,
            limit=limit
        )
        print(f"budget_service.get_budgets returned {len(budgets)} budgets")
        sys.stdout.flush()
        return budgets
    except Exception as e:
        print(f"ERROR in list_budgets_endpoint: {str(e)}")
        print("Traceback:")
        traceback.print_exc()
        sys.stdout.flush()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving budgets: {str(e)}",
        )


@router.post("", response_model=Budget)
def create_budget_endpoint(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    budget_in: BudgetCreate,
) -> Any:
    """
    Create a new budget.
    """
    try:
        print(f"Creating budget endpoint called with data: {budget_in.dict()}")
        print(f"User: {current_user.email} (ID: {current_user.id})")
        
        # Validate the budget data
        if budget_in.amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Budget amount must be greater than 0"
            )
            
        if budget_in.period == "monthly" and not budget_in.month:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Month is required for monthly budgets"
            )
            
        # Create the budget using the service module
        budget = budget_service.create_budget(db=db, budget_in=budget_in, user_id=current_user.id)
        return budget
        
    except HTTPException as he:
        # Re-raise HTTP exceptions with proper status codes
        print(f"HTTP exception in create_budget_endpoint: {he.detail}")
        raise
        
    except Exception as e:
        print(f"Unexpected error in create_budget_endpoint: {str(e)}")
        print(f"Budget data: {budget_in.dict()}")
        print(f"User ID: {current_user.id}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create budget: {str(e)}"
        )


@router.put("/{budget_id}", response_model=Budget)
def update_budget_endpoint(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    budget_id: int,
    budget_in: BudgetUpdate,
) -> Any:
    """
    Update a budget.
    """
    budget = budget_service.update_budget(db=db, budget_id=budget_id, budget_in=budget_in, user_id=current_user.id)
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found",
        )
    return budget


@router.delete("/{budget_id}", response_model=bool)
def delete_budget_endpoint(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    budget_id: int,
) -> Any:
    """
    Delete a budget.
    """
    success = budget_service.delete_budget(db=db, budget_id=budget_id, user_id=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found",
        )
    return success 