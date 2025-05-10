from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Category(Base):
    """
    Category database model for classifying expenses.
    """
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    color = Column(String, default="#3498db")  # Default color as hex code
    icon = Column(String, default="tag")       # Default icon identifier
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="categories")
    expenses = relationship("Expense", back_populates="category", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="category", cascade="all, delete-orphan") 