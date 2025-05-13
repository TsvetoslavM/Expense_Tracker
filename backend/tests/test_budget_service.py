import pytest
import datetime
from decimal import Decimal
from unittest.mock import MagicMock, patch

from sqlalchemy.orm import Session
from app.models.budget import Budget
from app.models.category import Category
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetUpdate
from app.services.budget import create_budget, get_budgets, get_budget, update_budget, delete_budget, check_budget_progress


class TestBudgetService:
    """
    Unit tests for the budget service functionality.
    """
    
    @pytest.fixture
    def mock_db(self):
        """Create a mock database session."""
        return MagicMock(spec=Session)
    
    @pytest.fixture
    def mock_user(self):
        """Create a mock user."""
        user = MagicMock(spec=User)
        user.id = 1
        user.email = "test@example.com"
        user.preferred_currency = "USD"
        return user
    
    @pytest.fixture
    def mock_category(self):
        """Create a mock category."""
        category = MagicMock(spec=Category)
        category.id = 1
        category.name = "Entertainment"
        category.user_id = 1
        return category
    
    def test_create_budget(self, mock_db, mock_user, mock_category):
        """Test creating a new budget."""
        # Arrange
        current_year = datetime.datetime.now().year
        current_month = datetime.datetime.now().month
        
        budget_data = BudgetCreate(
            amount=Decimal("500.00"),
            year=current_year,
            month=current_month,
            category_id=1,
            currency="USD",
            period="monthly"
        )
        
        # Mock the query operations
        mock_db.query.return_value.filter.return_value.first.return_value = mock_category
        mock_db.query.return_value.filter.return_value.filter.return_value.filter.return_value.filter.return_value.first.return_value = None  # No existing budget
        
        # Act
        result = create_budget(db=mock_db, budget=budget_data, user_id=mock_user.id)
        
        # Assert
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        assert result.amount == budget_data.amount
        assert result.year == budget_data.year
        assert result.month == budget_data.month
        assert result.category_id == budget_data.category_id
        assert result.user_id == mock_user.id
    
    def test_create_budget_duplicate(self, mock_db, mock_user, mock_category):
        """Test creating a budget that already exists for the same period and category."""
        # Arrange
        current_year = datetime.datetime.now().year
        current_month = datetime.datetime.now().month
        
        budget_data = BudgetCreate(
            amount=Decimal("500.00"),
            year=current_year,
            month=current_month,
            category_id=1,
            currency="USD",
            period="monthly"
        )
        
        existing_budget = MagicMock(spec=Budget, id=1, user_id=mock_user.id)
        
        # Mock the query operations
        mock_db.query.return_value.filter.return_value.first.return_value = mock_category
        mock_db.query.return_value.filter.return_value.filter.return_value.filter.return_value.filter.return_value.first.return_value = existing_budget
        
        # Act and Assert
        with pytest.raises(Exception) as excinfo:
            create_budget(db=mock_db, budget=budget_data, user_id=mock_user.id)
        
        assert "already exists" in str(excinfo.value).lower()
    
    def test_get_budgets(self, mock_db, mock_user):
        """Test retrieving a list of budgets."""
        # Arrange
        current_year = datetime.datetime.now().year
        mock_budgets = [
            MagicMock(spec=Budget, id=1, amount=500.0, year=current_year, month=1, user_id=mock_user.id),
            MagicMock(spec=Budget, id=2, amount=600.0, year=current_year, month=2, user_id=mock_user.id)
        ]
        
        # Mock the query operations
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = mock_budgets
        
        # Act
        result = get_budgets(
            db=mock_db, 
            user_id=mock_user.id,
            skip=0,
            limit=10
        )
        
        # Assert
        assert len(result) == 2
        assert result[0].id == 1
        assert result[1].id == 2
        assert mock_db.query.called
    
    def test_get_budgets_with_filters(self, mock_db, mock_user):
        """Test retrieving a list of budgets with specific filters."""
        # Arrange
        current_year = datetime.datetime.now().year
        mock_budgets = [
            MagicMock(spec=Budget, id=1, amount=500.0, year=current_year, month=1, category_id=1, user_id=mock_user.id)
        ]
        
        # Mock the query operations
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = mock_budgets
        
        # Act
        result = get_budgets(
            db=mock_db, 
            user_id=mock_user.id,
            year=current_year,
            month=1,
            category_id=1,
            skip=0,
            limit=10
        )
        
        # Assert
        assert len(result) == 1
        assert result[0].id == 1
        assert result[0].year == current_year
        assert result[0].month == 1
        assert result[0].category_id == 1
        assert mock_db.query.called
    
    def test_get_budget(self, mock_db, mock_user):
        """Test retrieving a single budget by ID."""
        # Arrange
        budget_id = 1
        mock_budget = MagicMock(spec=Budget, id=budget_id, user_id=mock_user.id)
        
        # Mock the query operations
        mock_db.query.return_value.filter.return_value.filter.return_value.first.return_value = mock_budget
        
        # Act
        result = get_budget(db=mock_db, budget_id=budget_id, user_id=mock_user.id)
        
        # Assert
        assert result is not None
        assert result.id == budget_id
        assert result.user_id == mock_user.id
    
    def test_update_budget(self, mock_db, mock_user):
        """Test updating an existing budget."""
        # Arrange
        budget_id = 1
        mock_budget = MagicMock(spec=Budget, id=budget_id, user_id=mock_user.id, amount=500.0)
        
        update_data = BudgetUpdate(
            amount=Decimal("600.00"),
        )
        
        # Mock the query operations
        mock_db.query.return_value.filter.return_value.filter.return_value.first.return_value = mock_budget
        
        # Act
        result = update_budget(db=mock_db, budget_id=budget_id, budget=update_data, user_id=mock_user.id)
        
        # Assert
        assert result is not None
        assert result.amount == update_data.amount
        assert mock_db.commit.called
        assert mock_db.refresh.called
    
    def test_delete_budget(self, mock_db, mock_user):
        """Test deleting a budget."""
        # Arrange
        budget_id = 1
        mock_budget = MagicMock(spec=Budget, id=budget_id, user_id=mock_user.id)
        
        # Mock the query operations
        mock_db.query.return_value.filter.return_value.filter.return_value.first.return_value = mock_budget
        
        # Act
        result = delete_budget(db=mock_db, budget_id=budget_id, user_id=mock_user.id)
        
        # Assert
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
    
    def test_check_budget_progress(self, mock_db, mock_user, mock_category):
        """Test checking budget progress with expenses."""
        # Arrange
        budget_id = 1
        budget_amount = 500.0
        mock_budget = MagicMock(spec=Budget, id=budget_id, user_id=mock_user.id, amount=budget_amount, category_id=1, year=2023, month=6)
        
        # Mock expenses that sum to 300.0
        mock_db.query.return_value.filter.return_value.filter.return_value.filter.return_value.filter.return_value.scalar.return_value = 300.0
        
        # Mock the budget query
        mock_db.query.return_value.filter.return_value.filter.return_value.first.return_value = mock_budget
        
        # Act
        result = check_budget_progress(db=mock_db, budget_id=budget_id, user_id=mock_user.id)
        
        # Assert
        assert result["total_budget"] == budget_amount
        assert result["spent"] == 300.0
        assert result["percentage"] == 60.0  # 300/500 * 100
        assert result["remaining"] == 200.0  # 500 - 300 