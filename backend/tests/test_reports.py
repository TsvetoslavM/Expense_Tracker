import pytest
from fastapi.testclient import TestClient
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base, get_db
from app.models.user import User
from app.models.expense import Expense
from app.models.category import Category
from app.core.security import create_access_token, get_password_hash
import os
import tempfile

# Import the test configuration
from test_config import setup_test_environment

# Set up the test environment
with setup_test_environment():
    # Import the app with test settings
    from app.main import app

# Setup test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency override
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="function")
def test_db():
    # Create test database
    Base.metadata.create_all(bind=engine)
    
    # Create test user and data
    db = TestingSessionLocal()
    
    # Create a test user
    test_user = User(
        email="test@example.com",
        hashed_password=get_password_hash("password123"),
        first_name="Test",
        last_name="User",
        is_active=True,
        preferred_currency="USD"
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    
    # Create a test category
    test_category = Category(
        name="Food",
        description="Groceries and restaurants",
        color="#00C49F",
        user_id=test_user.id
    )
    db.add(test_category)
    db.commit()
    db.refresh(test_category)
    
    # Create test expenses
    current_year = datetime.now().year
    expenses = [
        Expense(
            amount=100.50,
            description="Grocery shopping",
            date=datetime(current_year, 1, 15),
            currency="USD",
            user_id=test_user.id,
            category_id=test_category.id
        ),
        Expense(
            amount=50.25,
            description="Restaurant dinner",
            date=datetime(current_year, 1, 20),
            currency="USD",
            user_id=test_user.id,
            category_id=test_category.id
        ),
        Expense(
            amount=75.00,
            description="Grocery shopping",
            date=datetime(current_year, 2, 10),
            currency="USD",
            user_id=test_user.id,
            category_id=test_category.id
        )
    ]
    db.add_all(expenses)
    db.commit()
    
    # Close the db session
    db.close()
    
    # Testing
    yield
    
    # Teardown
    Base.metadata.drop_all(bind=engine)
    
    # Remove test database file
    if os.path.exists("./test.db"):
        os.remove("./test.db")

def get_token_headers(user_id: int):
    access_token = create_access_token(user_id)
    return {"Authorization": f"Bearer {access_token}"}

def test_generate_expenses_csv(test_db):
    # Arrange
    current_year = datetime.now().year
    user_id = 1  # Test user ID from fixture
    headers = get_token_headers(user_id)
    
    # Act
    response = client.get(f"/api/reports/csv?year={current_year}", headers=headers)
    
    # Assert
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert "attachment; filename=expenses_" in response.headers["content-disposition"]
    
    # Check content
    content = response.content.decode("utf-8")
    assert "Date,Category,Description,Amount,Currency,Notes" in content
    assert "Grocery shopping" in content
    assert "Restaurant dinner" in content

def test_generate_expenses_csv_with_month_filter(test_db):
    # Arrange
    current_year = datetime.now().year
    user_id = 1  # Test user ID from fixture
    headers = get_token_headers(user_id)
    
    # Act
    response = client.get(
        f"/api/reports/csv?year={current_year}&month=1", 
        headers=headers
    )
    
    # Assert
    assert response.status_code == 200
    assert "Grocery shopping" in response.content.decode("utf-8")
    assert "Restaurant dinner" in response.content.decode("utf-8")
    # This expense is from February, should not be included
    assert "75.00" not in response.content.decode("utf-8")

def test_generate_expenses_pdf(test_db):
    # Arrange
    current_year = datetime.now().year
    user_id = 1  # Test user ID from fixture
    headers = get_token_headers(user_id)
    
    # Act
    response = client.get(
        f"/api/reports/pdf?year={current_year}", 
        headers=headers
    )
    
    # Assert
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert "attachment; filename=expense_report_" in response.headers["content-disposition"]
    
    # Save PDF to temporary file for content validation
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_file:
        temp_file.write(response.content)
        temp_path = temp_file.name
    
    # Validate PDF exists and has content
    assert os.path.exists(temp_path)
    assert os.path.getsize(temp_path) > 0
    
    # Cleanup
    os.unlink(temp_path)

def test_annual_summary(test_db):
    # Arrange
    current_year = datetime.now().year
    user_id = 1  # Test user ID from fixture
    headers = get_token_headers(user_id)
    
    # Act
    response = client.get(
        f"/api/reports/summary/annual?year={current_year}", 
        headers=headers
    )
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    
    # Check structure
    assert "year" in data
    assert "total_amount" in data
    assert "months" in data
    assert "categories" in data
    
    # Check values
    assert data["year"] == current_year
    assert data["total_amount"] == 225.75  # Sum of all test expenses
    
    # Verify months data
    assert len(data["months"]) == 12
    january_data = data["months"][0]  # January is index 0
    assert january_data["month"] == 1
    assert january_data["month_name"] == "January"
    assert january_data["amount"] == 150.75  # Sum of January expenses
    
    # Verify categories data
    assert len(data["categories"]) == 1  # Only one category
    assert data["categories"][0]["name"] == "Food"
    assert data["categories"][0]["amount"] == 225.75
    assert data["categories"][0]["percentage"] == 100.0

def test_invalid_month_parameter(test_db):
    # Arrange
    current_year = datetime.now().year
    user_id = 1  # Test user ID from fixture
    headers = get_token_headers(user_id)
    
    # Act - Try with invalid month
    response = client.get(
        f"/api/reports/csv?year={current_year}&month=13", 
        headers=headers
    )
    
    # Assert
    assert response.status_code == 400
    assert response.json()["detail"] == "Month must be between 1 and 12"

def test_unauthorized_access(test_db):
    # Arrange
    current_year = datetime.now().year
    
    # Act - Try without authentication
    response = client.get(f"/api/reports/csv?year={current_year}")
    
    # Assert
    assert response.status_code == 401 