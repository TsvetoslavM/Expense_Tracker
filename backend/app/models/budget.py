from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, ForeignKey, Date, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Budget(Base):
    """Budget model for tracking spending limits by category."""
    
    __tablename__ = "budgets"
    
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=True)
    period = Column(String, nullable=True)  # monthly, yearly, custom
    currency = Column(String, default="USD")
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    category = relationship("Category", back_populates="budgets")
    user = relationship("User", back_populates="budgets") 