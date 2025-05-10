from datetime import datetime
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Expense(Base):
    """
    Expense database model.
    """
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    date = Column(DateTime, nullable=False, default=datetime.utcnow)
    currency = Column(String, default="USD")
    
    # Additional details
    notes = Column(Text, nullable=True)
    attachment_url = Column(String, nullable=True)  # URL to attached receipt or document
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="expenses")
    category = relationship("Category", back_populates="expenses") 