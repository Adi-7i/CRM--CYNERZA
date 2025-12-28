"""
SQLAlchemy models for database tables.
"""
from app.models.base import Base
from app.models.user import User

# Export all models for easy importing
__all__ = ["Base", "User"]
