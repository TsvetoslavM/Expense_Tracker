import pytest
import datetime
from decimal import Decimal
from unittest.mock import MagicMock, patch

from sqlalchemy.orm import Session
from app.models.expense import Expense
from app.models.category import Category
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseUpdate
from app.schemas.expense import create_expense, get_expenses, get_expense, update_expense, delete_expense


class TestExpenseService:
    """
    Unit tests for the expense service functionality.
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
        category.name = "Food"
        category.user_id = 1
        return category
    
    def test_create_expense(self, mock_db, mock_user, mock_category):
        """Test creating a new expense."""
        # Arrange
        expense_data = ExpenseCreate(
            amount=Decimal("50.75"),
            description="Grocery shopping",
            date=datetime.datetime.now(),
            category_id=1,
            currency="USD"
        )
        
        # Mock the query operations
        mock_db.query.return_value.filter.return_value.first.return_value = mock_category
        
        # Act
        result = create_expense(db=mock_db, expense=expense_data, user_id=mock_user.id)
        
        # Assert
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        assert result.amount == expense_data.amount
        assert result.description == expense_data.description
        assert result.category_id == expense_data.category_id
        assert result.user_id == mock_user.id
    
    def test_get_expenses(self, mock_db, mock_user):
        """Test retrieving a list of expenses."""
        # Arrange
        mock_expenses = [
            MagicMock(spec=Expense, id=1, amount=100.0, user_id=mock_user.id),
            MagicMock(spec=Expense, id=2, amount=200.0, user_id=mock_user.id)
        ]
        
        # Mock the query operations
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = mock_expenses
        
        # Act
        result = get_expenses(
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
    
    def test_get_expense(self, mock_db, mock_user):
        """Test retrieving a single expense by ID."""
        # Arrange
        expense_id = 1
        mock_expense = MagicMock(spec=Expense, id=expense_id, user_id=mock_user.id)
        
        # Mock the query operations
        mock_db.query.return_value.filter.return_value.filter.return_value.first.return_value = mock_expense
        
        # Act
        result = get_expense(db=mock_db, expense_id=expense_id, user_id=mock_user.id)
        
        # Assert
        assert result is not None
        assert result.id == expense_id
        assert result.user_id == mock_user.id
    
    def test_get_expense_not_found(self, mock_db, mock_user):
        """Test retrieving a non-existent expense."""
        # Arrange
        expense_id = 999  # Non-existent ID
        
        # Mock the query operations to return None
        mock_db.query.return_value.filter.return_value.filter.return_value.first.return_value = None
        
        # Act
        result = get_expense(db=mock_db, expense_id=expense_id, user_id=mock_user.id)
        
        # Assert
        assert result is None
    
    def test_update_expense(self, mock_db, mock_user):
        """Test updating an existing expense."""
        # Arrange
        expense_id = 1
        mock_expense = MagicMock(spec=Expense, id=expense_id, user_id=mock_user.id, amount=100.0, description="Old description")
        
        update_data = ExpenseUpdate(
            amount=Decimal("150.25"),
            description="Updated description"
        )
        
        # Mock the query operations
        mock_db.query.return_value.filter.return_value.filter.return_value.first.return_value = mock_expense
        
        # Act
        result = update_expense(db=mock_db, expense_id=expense_id, expense=update_data, user_id=mock_user.id)
        
        # Assert
        assert result is not None
        assert result.amount == update_data.amount
        assert result.description == update_data.description
        assert mock_db.commit.called
        assert mock_db.refresh.called
    
    def test_update_expense_not_found(self, mock_db, mock_user):
        """Test updating a non-existent expense."""
        # Arrange
        expense_id = 999  # Non-existent ID
        
        update_data = ExpenseUpdate(
            amount=Decimal("150.25"),
            description="Updated description"
        )
        
        # Mock the query operations to return None
        mock_db.query.return_value.filter.return_value.filter.return_value.first.return_value = None
        
        # Act
        result = update_expense(db=mock_db, expense_id=expense_id, expense=update_data, user_id=mock_user.id)
        
        # Assert
        assert result is None
        assert not mock_db.commit.called
    
    def test_delete_expense(self, mock_db, mock_user):
        """Test deleting an expense."""
        # Arrange
        expense_id = 1
        mock_expense = MagicMock(spec=Expense, id=expense_id, user_id=mock_user.id)
        
        # Mock the query operations
        mock_db.query.return_value.filter.return_value.filter.return_value.first.return_value = mock_expense
        
        # Act
        result = delete_expense(db=mock_db, expense_id=expense_id, user_id=mock_user.id)
        
        # Assert
        assert result is True
        assert mock_db.delete.called
        assert mock_db.commit.called
    
    def test_delete_expense_not_found(self, mock_db, mock_user):
        """Test deleting a non-existent expense."""
        # Arrange
        expense_id = 999  # Non-existent ID
        
        # Mock the query operations to return None
        mock_db.query.return_value.filter.return_value.filter.return_value.first.return_value = None
        
        # Act
        result = delete_expense(db=mock_db, expense_id=expense_id, user_id=mock_user.id)
        
        # Assert
        assert result is False
        assert not mock_db.delete.called
        assert not mock_db.commit.called 