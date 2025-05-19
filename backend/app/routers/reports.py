import csv
import io
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.responses import StreamingResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from sqlalchemy import extract, func
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.category import Category
from app.models.expense import Expense
from app.models.user import User
from app.schemas.expense import ExpenseWithCategory
from app.services.export import generate_csv, generate_pdf

router = APIRouter()


@router.get("/csv", response_class=StreamingResponse)
def download_csv_report(
    year: Optional[int] = None,
    month: Optional[int] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Generate and download a CSV report of expenses with optional filtering.
    """
    # Build query
    query = db.query(Expense).filter(Expense.user_id == current_user.id)
    
    # Apply filters
    if year:
        query = query.filter(extract('year', Expense.date) == year)
    if month:
        query = query.filter(extract('month', Expense.date) == month)
    if category_id:
        query = query.filter(Expense.category_id == category_id)
    
    # Get expenses ordered by date with category info
    expenses = query.options(joinedload(Expense.category)).order_by(Expense.date.desc()).all()
    
    # Generate CSV content
    try:
        csv_content = generate_csv(expenses, current_user)
        
        # Return as downloadable file
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        period = f"{year or 'all'}" if not month else f"{year or 'all'}_{month:02d}"
        filename = f"expense_report_{period}_{timestamp}.csv"
        
        return StreamingResponse(
            iter([csv_content]), 
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        print(f"Error generating CSV report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate CSV report: {str(e)}"
        )


@router.get("/pdf", response_class=StreamingResponse)
def download_pdf_report(
    year: int = Query(..., description="Year to generate report for"),
    month: Optional[int] = Query(None, description="Month to generate report for (1-12)"),
    category_id: Optional[int] = Query(None, description="Category ID to filter expenses"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Generate and download a PDF report of expenses for a specific year and optional month.
    """
    # Validate month if provided
    if month is not None and (month < 1 or month > 12):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Month must be between 1 and 12",
        )
    
    try:
        # Build query
        query = (
            db.query(Expense)
            .filter(
                Expense.user_id == current_user.id,
                extract('year', Expense.date) == year,
            )
        )
        
        # Only apply month filter if a valid month is provided
        if month is not None and month >= 1 and month <= 12:
            query = query.filter(extract('month', Expense.date) == month)
            
        # Add category filter if provided and valid
        if category_id is not None and category_id > 0:
            query = query.filter(Expense.category_id == category_id)
        
        # Get expenses with category information
        expenses = query.options(joinedload(Expense.category)).order_by(Expense.date.desc()).all()
        
        # Get category summary
        category_summary = (
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
        )
        
        # Only apply month filter to summary if a valid month is provided
        if month is not None and month >= 1 and month <= 12:
            category_summary = category_summary.filter(extract('month', Expense.date) == month)
            
        # Add category filter to summary if provided and valid
        if category_id is not None and category_id > 0:
            category_summary = category_summary.filter(Category.id == category_id)
        
        category_summary = category_summary.group_by(Category.name, Category.color).all()
        
        # Generate PDF content
        pdf_content = generate_pdf(expenses, category_summary, year, month, current_user)
        
        # Return as downloadable file
        period = f"{year}" if month is None or month < 1 or month > 12 else f"{year}_{month:02d}"
        category_suffix = f"_category_{category_id}" if category_id is not None and category_id > 0 else ""
        filename = f"expense_report_{period}{category_suffix}.pdf"
        
        return StreamingResponse(
            iter([pdf_content]), 
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        print(f"Error generating PDF report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF report: {str(e)}"
        )


@router.post("/import/csv")
def import_expenses_from_csv(
    file: bytes,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Import expenses from a CSV file.
    
    Expected CSV format:
    Date,Category,Description,Amount,Currency,Notes
    YYYY-MM-DD,Category Name,Description,123.45,USD,Notes
    """
    # TODO: Implement CSV import functionality
    # This would involve:
    # 1. Parsing the CSV file
    # 2. Validating each row
    # 3. Looking up or creating categories
    # 4. Creating expense records
    
    # For now, return a placeholder response
    return {"detail": "CSV import functionality coming soon"}


@router.get("/summary/annual", response_model=Dict[str, Any])
def get_annual_summary(
    year: int = Query(..., description="Year to get summary for"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get annual summary of expenses by month and category.
    """
    # Get monthly totals
    monthly_totals = (
        db.query(
            extract('month', Expense.date).label("month"),
            func.sum(Expense.amount).label("total_amount"),
        )
        .filter(
            Expense.user_id == current_user.id,
            extract('year', Expense.date) == year,
        )
        .group_by(extract('month', Expense.date))
        .order_by(extract('month', Expense.date))
        .all()
    )
    
    # Get category totals
    category_totals = (
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
        .all()
    )
    
    # Calculate total amount for the year
    total_amount = sum(item.total_amount for item in monthly_totals)
    
    # Format monthly data
    monthly_data = [
        {
            "month": item.month,
            "amount": item.total_amount,
            "percentage": (item.total_amount / total_amount * 100) if total_amount > 0 else 0,
        }
        for item in monthly_totals
    ]
    
    # Format category data
    category_data = [
        {
            "name": item.name,
            "color": item.color,
            "amount": item.total_amount,
            "percentage": (item.total_amount / total_amount * 100) if total_amount > 0 else 0,
        }
        for item in category_totals
    ]
    
    return {
        "year": year,
        "total_amount": total_amount,
        "monthly_data": monthly_data,
        "category_data": category_data,
    } 