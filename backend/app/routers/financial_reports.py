from fastapi import APIRouter, Query, Depends
from fastapi.responses import StreamingResponse
from typing import Optional
from datetime import datetime
from io import BytesIO

from app.services.report_generator import generate_csv, generate_pdf
from app.core.deps import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/api/reports", tags=["Reports"])

# Simulated function to fetch expense data — replace with real DB queries
def get_report_data(year: int, month: Optional[int], category_id: Optional[int], user_id: int) -> list:
    return [
        {"date": f"{year}-{month or 1}-01", "category_id": category_id or 0, "amount": 100, "description": "Groceries"},
        {"date": f"{year}-{month or 1}-15", "category_id": category_id or 0, "amount": 200, "description": "Transport"},
    ]

@router.get("/csv")
def download_csv_report(
    year: int = Query(...),
    month: Optional[int] = Query(None),
    category_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_active_user),
):
    data = get_report_data(year, month, category_id, current_user.id)
    csv_content = generate_csv(data)
    file_like = BytesIO(csv_content.encode("utf-8"))
    filename = f"report_{year}_{month or 'all'}_{datetime.now().strftime('%Y%m%d')}.csv"
    return StreamingResponse(file_like, media_type="text/csv", headers={
        "Content-Disposition": f"attachment; filename={filename}"
    })

@router.get("/pdf")
def download_pdf_report(
    year: int = Query(...),
    month: Optional[int] = Query(None),
    category_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_active_user),
):
    data = get_report_data(year, month, category_id, current_user.id)
    pdf_bytes = generate_pdf(data)
    file_like = BytesIO(pdf_bytes)
    filename = f"report_{year}_{month or 'all'}_{datetime.now().strftime('%Y%m%d')}.pdf"
    return StreamingResponse(file_like, media_type="application/pdf", headers={
        "Content-Disposition": f"attachment; filename={filename}"
    })
