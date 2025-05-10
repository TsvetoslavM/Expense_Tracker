from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from fastapi import HTTPException, status

from app.core.config import settings
from app.core.database import get_db, init_db, SessionLocal
from app.routers import auth, users, expenses, categories, budgets, reports, financial_reports
from app.core.deps import get_current_active_user
from app.models.user import User

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="API for Expense Tracker Application",
    version="1.0.0",
)

# Configure CORS - use settings from config
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["Expenses"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(budgets.router, prefix="/api/budgets", tags=["Budgets"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(financial_reports.router, prefix="/api/financial_reports", tags=["Financial Reports"])

# Health check endpoint
@app.get("/api/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint to verify API is working and can connect to the database."""
    try:
        # Try to make a simple database query
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}


@app.on_event("startup")
async def startup_event():
    """Initialize the database on application startup."""
    init_db()
    
    # Create a test user for development
    try:
        from app.models.user import User
        from app.core.security import get_password_hash
        from sqlalchemy.orm import Session
        
        db = SessionLocal()
        try:
            # Check if test user already exists
            test_user = db.query(User).filter(User.email == "test@example.com").first()
            if not test_user:
                # Create test user
                user = User(
                    email="test@example.com",
                    hashed_password=get_password_hash("password123"),
                    is_active=True,
                    is_admin=False,
                    first_name="Test",
                    last_name="User",
                    preferred_currency="USD"
                )
                db.add(user)
                db.commit()
                print("Test user created successfully!")
                print("Login credentials: test@example.com / password123")
            else:
                print("Test user already exists")
        finally:
            db.close()
    except Exception as e:
        print(f"Error creating test user: {str(e)}")


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint that redirects to API documentation."""
    return {
        "message": "Welcome to the Expense Tracker API!",
        "documentation": "/docs",
    }


@app.get("/api/budgets-list", tags=["Budgets"])
def get_budgets_list(
    year: Optional[int] = None,
    month: Optional[int] = None,
    category_id: Optional[int] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Direct budget list endpoint to bypass router conflicts."""
    try:
        print(f"Direct budget list endpoint called for user_id={current_user.id}")
        
        # Use direct SQL query for simplicity and reliability
        query = """
            SELECT id, amount, year, month, period, currency, category_id, user_id, created_at, updated_at
            FROM budgets
            WHERE user_id = :user_id
        """
        params = {"user_id": current_user.id}
        
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
        
        # Execute the query
        result = db.execute(text(query), params)
        rows = result.fetchall()
        
        # Convert to dictionaries
        budgets = []
        for row in rows:
            budget = {
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
            budgets.append(budget)
        
        print(f"Direct endpoint returned {len(budgets)} budgets")
        return budgets
    except Exception as e:
        print(f"Error in direct budget list endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving budgets: {str(e)}"
        ) 