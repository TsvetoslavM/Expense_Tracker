from datetime import datetime, timedelta
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import extract, func
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_active_user, get_current_admin_user
from app.models.category import Category
from app.models.expense import Expense
from app.models.user import User
from app.schemas.expense import (
    Expense as ExpenseSchema,
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseWithCategory,
)

router = APIRouter()


@router.get("/", response_model=List[ExpenseWithCategory])
def get_expenses(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get all expenses for the current user with optional filtering.
    """
    try:
        print(f"Fetching expenses for user_id={current_user.id} with filters: "
              f"search={search}, category_id={category_id}, start_date={start_date}, end_date={end_date}, "
              f"min_amount={min_amount}, max_amount={max_amount}, skip={skip}, limit={limit}")
        
        query = db.query(Expense).filter(Expense.user_id == current_user.id)
        
        # Apply filters if provided
        if search:
            search_term = f"%{search}%"
            print(f"Searching for expenses with description like: {search_term}")
            query = query.filter(Expense.description.ilike(search_term))
        if category_id:
            query = query.filter(Expense.category_id == category_id)
        if start_date:
            query = query.filter(Expense.date >= start_date)
        if end_date:
            query = query.filter(Expense.date <= end_date)
        if min_amount:
            query = query.filter(Expense.amount >= min_amount)
        if max_amount:
            query = query.filter(Expense.amount <= max_amount)
        
        # Order by date (most recent first) and apply pagination
        expenses = (
            query.order_by(Expense.date.desc())
            .options(joinedload(Expense.category))
            .offset(skip)
            .limit(limit)
            .all()
        )
        
        print(f"Found {len(expenses)} expenses for user_id={current_user.id}")
        
        # Check if categories are properly loaded
        category_issues = 0
        for expense in expenses:
            if not hasattr(expense, 'category') or not expense.category:
                category_issues += 1
                print(f"Warning: Expense id={expense.id} has missing category (category_id={expense.category_id})")
        
        if category_issues > 0:
            print(f"Warning: {category_issues} expenses have missing category relationships")
        
        return expenses
    except Exception as e:
        print(f"Error fetching expenses: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching expenses: {str(e)}",
        )


@router.post("/", response_model=ExpenseSchema)
def create_expense(
    expense_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create a new expense.
    """
    try:
        print(f"Creating expense with data: {expense_in.dict()}")
        
        # Verify category exists and belongs to the user
        category = (
            db.query(Category)
            .filter(Category.id == expense_in.category_id, Category.user_id == current_user.id)
            .first()
        )
        
        if not category:
            print(f"Category not found: category_id={expense_in.category_id}, user_id={current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found or doesn't belong to the user",
            )
        
        # Create expense
        expense = Expense(
            **expense_in.dict(),
            user_id=current_user.id,
        )
        
        print(f"Adding expense to database: {expense.__dict__}")
        db.add(expense)
        
        try:
            db.commit()
            db.refresh(expense)
            print(f"Expense created successfully with id: {expense.id}")
        except Exception as commit_error:
            db.rollback()
            print(f"Database error during commit: {str(commit_error)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(commit_error)}",
            )
        
        # Ensure all expense data is loaded
        if not hasattr(expense, 'id') or not expense.id:
            print("Warning: Expense created but ID is missing")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Expense created but ID is missing",
            )
        
        # TODO: Check if this expense puts the user over budget and send notification
        
        return expense
    except HTTPException:
        # Re-raise HTTP exceptions as they're already formatted
        raise
    except Exception as e:
        print(f"Unexpected error creating expense: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}",
        )


@router.get("/{expense_id}", response_model=ExpenseWithCategory)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get a specific expense by ID.
    """
    expense = (
        db.query(Expense)
        .filter(Expense.id == expense_id, Expense.user_id == current_user.id)
        .options(joinedload(Expense.category))
        .first()
    )
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found",
        )
    
    return expense


@router.put("/{expense_id}", response_model=ExpenseSchema)
def update_expense(
    expense_id: int,
    expense_in: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update an expense.
    """
    expense = (
        db.query(Expense)
        .filter(Expense.id == expense_id, Expense.user_id == current_user.id)
        .first()
    )
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found",
        )
    
    # Check if category_id is being updated and verify it exists and belongs to the user
    if expense_in.category_id and expense_in.category_id != expense.category_id:
        category = (
            db.query(Category)
            .filter(Category.id == expense_in.category_id, Category.user_id == current_user.id)
            .first()
        )
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found or doesn't belong to the user",
            )
    
    # Update expense attributes
    for key, value in expense_in.dict(exclude_unset=True).items():
        setattr(expense, key, value)
    
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}", response_model=ExpenseSchema)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Delete an expense.
    """
    expense = (
        db.query(Expense)
        .filter(Expense.id == expense_id, Expense.user_id == current_user.id)
        .first()
    )
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found",
        )
    
    db.delete(expense)
    db.commit()
    return expense


@router.get("/summary/monthly", response_model=dict)
def get_monthly_summary(
    year: int = Query(..., description="Year to get summary for"),
    month: Optional[int] = Query(None, description="Month to get summary for (1-12)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get monthly summary of expenses by category.
    """
    query = (
        db.query(
            Category.name,
            Category.color,
            func.sum(Expense.amount).label("total_amount"),
        )
        .join(Expense, Expense.category_id == Category.id)
        .filter(
            Expense.user_id == current_user.id,
            extract('year', Expense.date) == year,
        )
        .group_by(Category.name, Category.color)
    )
    
    if month:
        if month < 1 or month > 12:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Month must be between 1 and 12",
            )
        query = query.filter(extract('month', Expense.date) == month)
    
    results = query.all()
    
    # Calculate total amount
    total_amount = sum(result.total_amount for result in results)
    
    # Format the results
    categories = [
        {
            "name": result.name,
            "color": result.color,
            "amount": result.total_amount,
            "percentage": (result.total_amount / total_amount * 100) if total_amount > 0 else 0,
        }
        for result in results
    ]
    
    return {
        "year": year,
        "month": month,
        "total_amount": total_amount,
        "categories": categories,
    }


# Admin endpoint to get all expenses
@router.get("/admin/all", response_model=List[ExpenseWithCategory])
def get_all_expenses(
    user_id: Optional[int] = None,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),  # Only admin can access
) -> Any:
    """
    Admin endpoint to get all expenses with optional filtering.
    """
    query = db.query(Expense)
    
    # Apply filters if provided
    if user_id:
        query = query.filter(Expense.user_id == user_id)
    if search:
        search_term = f"%{search}%"
        query = query.filter(Expense.description.ilike(search_term))
    if category_id:
        query = query.filter(Expense.category_id == category_id)
    if start_date:
        query = query.filter(Expense.date >= start_date)
    if end_date:
        query = query.filter(Expense.date <= end_date)
    
    # Order by date (most recent first) and apply pagination
    expenses = (
        query.order_by(Expense.date.desc())
        .options(joinedload(Expense.category))
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return expenses 