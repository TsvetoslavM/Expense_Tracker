import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.models.user import User
from app.core.security import create_access_token, get_password_hash
from io import BytesIO

# Import the test configuration
from test_config import setup_test_environment

# Set up the test environment
with setup_test_environment():
    # Import the app with test settings
    from app.main import app

client = TestClient(app)

# Mock user for testing
MOCK_USER = User(
    id=1,
    email="test@example.com",
    hashed_password=get_password_hash("password123"),
    first_name="Test",
    last_name="User",
    is_active=True,
    preferred_currency="USD"
)

def get_token_headers(user_id: int = 1):
    access_token = create_access_token(user_id)
    return {"Authorization": f"Bearer {access_token}"}

# Mock the user dependency
@pytest.fixture(autouse=True)
def mock_dependencies():
    with patch("app.routers.financial_reports.get_current_active_user", return_value=MOCK_USER):
        yield

# Mock the report generator functions
@pytest.fixture
def mock_report_generators():
    with patch("app.routers.financial_reports.generate_csv") as mock_csv, \
         patch("app.routers.financial_reports.generate_pdf") as mock_pdf:
        
        # Setup mock responses
        mock_csv.return_value = "date,category,amount,description\n2023-01-01,Food,100,Groceries"
        mock_pdf.return_value = b"%PDF-1.4 mock pdf content"
        
        yield {
            "csv": mock_csv,
            "pdf": mock_pdf
        }

def test_download_csv_report(mock_report_generators):
    # Arrange
    year = 2023
    month = 1
    headers = get_token_headers()
    
    # Act
    response = client.get(f"/api/reports/csv?year={year}&month={month}", headers=headers)
    
    # Assert
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert f"report_{year}_{month}_" in response.headers["content-disposition"]
    
    # Verify mock was called with correct parameters
    mock_report_generators["csv"].assert_called_once()
    # First argument of the first call
    args, _ = mock_report_generators["csv"].call_args
    # The data list should have been passed
    assert isinstance(args[0], list)
    
    # Check content
    assert "date,category,amount,description" in response.content.decode("utf-8")
    assert "Groceries" in response.content.decode("utf-8")

def test_download_csv_report_all_months(mock_report_generators):
    # Arrange
    year = 2023
    headers = get_token_headers()
    
    # Act
    response = client.get(f"/api/reports/csv?year={year}", headers=headers)
    
    # Assert
    assert response.status_code == 200
    assert "all" in response.headers["content-disposition"]
    
    # Verify mock was called with correct parameters
    mock_report_generators["csv"].assert_called_once()

def test_download_pdf_report(mock_report_generators):
    # Arrange
    year = 2023
    month = 1
    headers = get_token_headers()
    
    # Act
    response = client.get(f"/api/reports/pdf?year={year}&month={month}", headers=headers)
    
    # Assert
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert f"report_{year}_{month}_" in response.headers["content-disposition"]
    
    # Verify mock was called with correct parameters
    mock_report_generators["pdf"].assert_called_once()
    # First argument of the first call
    args, _ = mock_report_generators["pdf"].call_args
    # The data list should have been passed
    assert isinstance(args[0], list)
    
    # Check content
    assert response.content.startswith(b"%PDF")

def test_download_pdf_report_with_category(mock_report_generators):
    # Arrange
    year = 2023
    category_id = 2
    headers = get_token_headers()
    
    # Act
    response = client.get(f"/api/reports/pdf?year={year}&category_id={category_id}", headers=headers)
    
    # Assert
    assert response.status_code == 200
    
    # Verify mock was called with correct parameters
    mock_report_generators["pdf"].assert_called_once()
    
    # Verify category_id was passed correctly to get_report_data
    # Since get_report_data is mocked internally and not directly accessible here, 
    # we can only check that the endpoint returns successfully

def test_unauthorized_access():
    # Act - Try without authentication
    response = client.get("/api/reports/csv?year=2023")
    
    # Assert
    assert response.status_code == 401

# Test error handling
def test_invalid_parameters(mock_report_generators):
    # Arrange
    headers = get_token_headers()
    
    # Act - Missing required year parameter
    response = client.get("/api/reports/csv", headers=headers)
    
    # Assert
    assert response.status_code == 422  # Unprocessable Entity

@patch("app.routers.financial_reports.generate_csv")
def test_csv_generator_error(mock_generate_csv, mock_dependencies):
    # Arrange
    mock_generate_csv.side_effect = Exception("Test error")
    headers = get_token_headers()
    
    # Act
    response = client.get("/api/reports/csv?year=2023", headers=headers)
    
    # Assert - FastAPI will return 500 for unhandled exceptions
    assert response.status_code == 500 