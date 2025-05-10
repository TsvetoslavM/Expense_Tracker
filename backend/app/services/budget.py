from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import and_, extract, func, text
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
import traceback

from app.models.budget import Budget
from app.models.category import Category
from app.models.expense import Expense
from app.schemas.budget import BudgetCreate, BudgetUpdate
from app.utils.date import get_month_date_range


def get_budget(db: Session, budget_id: int, user_id: int) -> Optional[Budget]:
    """
    Get a budget by ID for a specific user.
    """
    return db.query(Budget).filter(
        Budget.id == budget_id, Budget.user_id == user_id
    ).first()


def get_budgets(
    db: Session, 
    user_id: int,
    year: Optional[int] = None,
    month: Optional[int] = None,
    category_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Budget]:
    """
    Get budgets for a user with optional filtering.
    """
    print(f"get_budgets called with: user_id={user_id}, year={year}, month={month}, category_id={category_id}")
    
    try:
        # Build the query with parameters
        query = """
            SELECT id, amount, year, month, period, currency, category_id, user_id, created_at, updated_at
            FROM budgets
            WHERE user_id = :user_id
        """
        params = {"user_id": user_id}
        
        # Add optional filters
        if year is not None:
            query += " AND year = :year"
            params["year"] = year
        if month is not None:
            query += " AND month = :month"
            params["month"] = month
        if category_id is not None:
            query += " AND category_id = :category_id"
            params["category_id"] = category_id
        
        # Add order and limits
        query += " ORDER BY year DESC, month DESC LIMIT :limit OFFSET :skip"
        params["limit"] = limit
        params["skip"] = skip
        
        print(f"Executing query: {query}")
        print(f"With parameters: {params}")
        
        # Execute the query
        result = db.execute(text(query), params)
        rows = result.fetchall()
        
        print(f"Query returned {len(rows)} rows")
        
        # Convert rows to Budget objects
        budgets = []
        for row in rows:
            budget_dict = {
                "id": row[0],
                "amount": row[1],
                "year": row[2],
                "month": row[3],
                "period": row[4],
                "currency": row[5],
                "category_id": row[6],
                "user_id": row[7],
                "created_at": row[8],
                "updated_at": row[9]
            }
            budget = Budget(**budget_dict)
            budgets.append(budget)
        
        return budgets
    except Exception as e:
        print(f"Error in get_budgets: {str(e)}")
        traceback.print_exc()
        raise


def create_budget(db: Session, budget_in: BudgetCreate, user_id: int) -> Budget:
    """
    Create a new budget.
    
    Args:
        db: Database session
        budget_in: Budget data
        user_id: User ID
        
    Returns:
        The created budget
    """
    # First make sure the database is accessible
    print("Testing database connection...")
    try:
        result = db.execute(text("SELECT 1"))
        result.scalar()
        print("Database connection is working")
    except Exception as e:
        print(f"Database connection error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection error: {str(e)}"
        )
    
    # Simple and direct approach - create the budget object
    print(f"Creating budget with data: {budget_in.dict()}")
    
    # Use direct SQL to insert, which we know works from our test
    try:
        print("Inserting budget with direct SQL")
        now = datetime.utcnow().isoformat()
        result = db.execute(text("""
            INSERT INTO budgets 
            (amount, year, month, period, currency, category_id, user_id, created_at, updated_at)
            VALUES 
            (:amount, :year, :month, :period, :currency, :category_id, :user_id, :created_at, :updated_at)
            RETURNING id
        """), {
            "amount": budget_in.amount,
            "year": budget_in.year,
            "month": budget_in.month,
            "period": budget_in.period,
            "currency": budget_in.currency or "USD",
            "category_id": budget_in.category_id,
            "user_id": user_id,
            "created_at": now,
            "updated_at": now
        })
        
        # Get the inserted ID
        budget_id = result.scalar()
        print(f"Budget inserted with ID: {budget_id}")
        
        # Commit the transaction
        db.commit()
        print("Transaction committed")
        
        # Retrieve the complete budget as a model object
        budget = db.query(Budget).filter(Budget.id == budget_id).first()
        if not budget:
            print(f"WARNING: Could not retrieve budget with ID {budget_id}")
            # Create a placeholder object to return
            budget = Budget(
                id=budget_id,
                amount=budget_in.amount,
                year=budget_in.year,
                month=budget_in.month,
                period=budget_in.period,
                currency=budget_in.currency or "USD",
                category_id=budget_in.category_id,
                user_id=user_id
            )
        else:
            print(f"Budget retrieved successfully: {budget.__dict__}")
        
        return budget
        
    except Exception as e:
        print(f"Error creating budget: {str(e)}")
        traceback.print_exc()
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


def update_budget(
    db: Session, budget_id: int, budget_in: BudgetUpdate, user_id: int
) -> Optional[Budget]:
    """
    Update an existing budget.
    """
    budget = get_budget(db, budget_id, user_id)
    if not budget:
        return None
    
    # Update budget attributes
    for key, value in budget_in.dict(exclude_unset=True).items():
        if value is not None:
            setattr(budget, key, value)
    
    db.commit()
    db.refresh(budget)
    return budget


def delete_budget(db: Session, budget_id: int, user_id: int) -> bool:
    """
    Delete a budget.
    """
    budget = get_budget(db, budget_id, user_id)
    if not budget:
        return False
    
    db.delete(budget)
    db.commit()
    return True


def get_budgets_with_stats(
    db: Session, 
    user_id: int,
    year: int,
    month: Optional[int] = None,
    category_id: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Get budgets with spending statistics for a specific period.
    """
    # Build query for budgets with categories
    query = (
        db.query(Budget)
        .join(Category, Budget.category_id == Category.id)
        .filter(
            Budget.user_id == user_id,
            Budget.year == year,
        )
        .options(joinedload(Budget.category))
    )
    
    # Apply additional filters
    if month:
        query = query.filter(Budget.month == month)
    if category_id:
        query = query.filter(Budget.category_id == category_id)
    
    # Get all matching budgets
    budgets = query.all()
    
    # Build date range filter for expenses
    date_filters = [extract('year', Expense.date) == year]
    if month:
        date_filters.append(extract('month', Expense.date) == month)
    
    # Build result list with spending stats
    result = []
    for budget in budgets:
        # Query to get total expenses for this category in this period
        expenses_query = (
            db.query(func.sum(Expense.amount).label("total"))
            .filter(
                Expense.user_id == user_id,
                Expense.category_id == budget.category_id,
                *date_filters
            )
        )
        
        # Execute query and get amount
        total_expenses = expenses_query.scalar() or 0.0
        
        # Calculate stats
        remaining_amount = budget.amount - total_expenses
        percentage_used = (total_expenses / budget.amount * 100) if budget.amount > 0 else 0
        
        # Create budget dict with stats
        budget_dict = {
            "id": budget.id,
            "amount": budget.amount,
            "year": budget.year,
            "month": budget.month,
            "period": budget.period,
            "currency": budget.currency,
            "category_id": budget.category_id,
            "category_name": budget.category.name,
            "category_color": budget.category.color,
            "spent_amount": total_expenses,
            "remaining_amount": remaining_amount,
            "percentage_used": percentage_used,
        }
        
        result.append(budget_dict)
    
    return result


def get_current_budgets(db: Session, user_id: int) -> List[Dict[str, Any]]:
    """
    Get budgets for the current month with spending statistics.
    """
    # Get current year and month
    current_date = datetime.now()
    current_year = current_date.year
    current_month = current_date.month
    
    # Call the generic function with current period
    return get_budgets_with_stats(
        db, 
        user_id, 
        year=current_year, 
        month=current_month
    ) 