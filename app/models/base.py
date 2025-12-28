"""
Base model class with common fields for all database models.
All models should inherit from this Base class.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.orm import declarative_base

# Create declarative base
Base = declarative_base()


class BaseModel(Base):
    """
    Abstract base model with common fields.
    All other models should inherit from this class.
    
    Fields:
        id: Primary key (auto-incrementing integer)
        created_at: Timestamp when record was created
        updated_at: Timestamp when record was last updated
    """
    __abstract__ = True  # This makes it an abstract class, won't create a table
    
    # Primary key - using Integer for simplicity, can be changed to UUID if needed
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Timestamps - automatically managed
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        comment="Timestamp when record was created"
    )
    
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        comment="Timestamp when record was last updated"
    )
    
    def __repr__(self):
        """String representation of the model."""
        return f"<{self.__class__.__name__}(id={self.id})>"
