import pytest
import datetime
from unittest.mock import MagicMock, patch

from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import verify_password, get_password_hash, create_access_token
from app.schemas.user import UserCreate
from app.services.user import create_user, get_user_by_email, authenticate_user


class TestAuthService:
    """
    Unit tests for the authentication service functionality.
    """
    
    @pytest.fixture
    def mock_db(self):
        """Create a mock database session."""
        return MagicMock(spec=Session)
    
    def test_get_password_hash(self):
        """Test password hashing."""
        # Arrange
        plain_password = "password123"
        
        # Act
        hashed_password = get_password_hash(plain_password)
        
        # Assert
        assert hashed_password != plain_password
        assert verify_password(plain_password, hashed_password)
        assert not verify_password("wrongpassword", hashed_password)
    
    def test_create_access_token(self):
        """Test JWT token creation."""
        # Arrange
        data = {"sub": "test@example.com"}
        
        # Act
        token = create_access_token(data)
        
        # Assert
        assert token is not None
        assert isinstance(token, str)
    
    def test_create_user(self, mock_db):
        """Test user creation."""
        # Arrange
        user_data = UserCreate(
            email="new_user@example.com",
            password="securepassword",
            first_name="New",
            last_name="User",
            preferred_currency="EUR"
        )
        
        # Mock the query operations
        mock_db.query.return_value.filter.return_value.first.return_value = None  # No existing user
        
        # Act
        result = create_user(db=mock_db, user=user_data)
        
        # Assert
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called
        assert result.email == user_data.email
        assert result.first_name == user_data.first_name
        assert result.last_name == user_data.last_name
        assert result.preferred_currency == user_data.preferred_currency
        assert hasattr(result, "hashed_password")
        assert result.hashed_password != user_data.password  # Password should be hashed
    
    def test_create_user_duplicate_email(self, mock_db):
        """Test creating a user with an email that already exists."""
        # Arrange
        user_data = UserCreate(
            email="existing@example.com",
            password="securepassword",
            first_name="New",
            last_name="User",
            preferred_currency="EUR"
        )
        
        existing_user = MagicMock(spec=User, email=user_data.email)
        
        # Mock the query operations
        mock_db.query.return_value.filter.return_value.first.return_value = existing_user
        
        # Act and Assert
        with pytest.raises(Exception) as excinfo:
            create_user(db=mock_db, user=user_data)
        
        assert "already registered" in str(excinfo.value).lower()
    
    def test_get_user_by_email(self, mock_db):
        """Test retrieving a user by email."""
        # Arrange
        email = "test@example.com"
        mock_user = MagicMock(spec=User, email=email)
        
        # Mock the query operations
        mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        
        # Act
        result = get_user_by_email(db=mock_db, email=email)
        
        # Assert
        assert result is not None
        assert result.email == email
    
    def test_get_user_by_email_not_found(self, mock_db):
        """Test retrieving a non-existent user by email."""
        # Arrange
        email = "nonexistent@example.com"
        
        # Mock the query operations to return None
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        # Act
        result = get_user_by_email(db=mock_db, email=email)
        
        # Assert
        assert result is None
    
    def test_authenticate_user_success(self, mock_db):
        """Test successful user authentication."""
        # Arrange
        email = "test@example.com"
        password = "password123"
        hashed_password = get_password_hash(password)
        
        mock_user = MagicMock(spec=User, email=email, hashed_password=hashed_password, is_active=True)
        
        # Mock the query operations
        mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        
        # Act
        result = authenticate_user(db=mock_db, email=email, password=password)
        
        # Assert
        assert result is not None
        assert result.email == email
    
    def test_authenticate_user_wrong_password(self, mock_db):
        """Test authentication with incorrect password."""
        # Arrange
        email = "test@example.com"
        correct_password = "password123"
        wrong_password = "wrongpassword"
        hashed_password = get_password_hash(correct_password)
        
        mock_user = MagicMock(spec=User, email=email, hashed_password=hashed_password, is_active=True)
        
        # Mock the query operations
        mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        
        # Act
        result = authenticate_user(db=mock_db, email=email, password=wrong_password)
        
        # Assert
        assert result is False
    
    def test_authenticate_user_inactive(self, mock_db):
        """Test authentication with an inactive user account."""
        # Arrange
        email = "inactive@example.com"
        password = "password123"
        hashed_password = get_password_hash(password)
        
        mock_user = MagicMock(spec=User, email=email, hashed_password=hashed_password, is_active=False)
        
        # Mock the query operations
        mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        
        # Act
        result = authenticate_user(db=mock_db, email=email, password=password)
        
        # Assert
        assert result is False
    
    def test_authenticate_user_not_found(self, mock_db):
        """Test authentication with a non-existent user."""
        # Arrange
        email = "nonexistent@example.com"
        password = "password123"
        
        # Mock the query operations to return None
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        # Act
        result = authenticate_user(db=mock_db, email=email, password=password)
        
        # Assert
        assert result is False 