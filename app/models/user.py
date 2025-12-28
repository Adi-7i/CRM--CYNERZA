"""
User model for authentication and authorization.
"""
from sqlalchemy import Column, String, Boolean, Enum
import enum

from app.models.base import BaseModel


class UserRole(str, enum.Enum):
    """
    User role enumeration.
    Defines the different roles a user can have in the system.
    """
    ADMIN = "admin"
    MANAGER = "manager"
    SALES = "sales"


class User(BaseModel):
    """
    User model for storing user information.
    Inherits id, created_at, and updated_at from BaseModel.
    
    Fields:
        full_name: User's full name
        email: User's email address (unique)
        hashed_password: Bcrypt hashed password
        role: User role (admin, manager, sales)
        is_active: Whether the user account is active
    """
    __tablename__ = "users"
    
    # User information
    full_name = Column(
        String(255),
        nullable=False,
        comment="User's full name"
    )
    
    email = Column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
        comment="User's email address (unique)"
    )
    
    hashed_password = Column(
        String(255),
        nullable=False,
        comment="Bcrypt hashed password"
    )
    
    # Role and status
    role = Column(
        Enum(UserRole),
        default=UserRole.SALES,
        nullable=False,
        comment="User role in the system"
    )
    
    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
        comment="Whether the user account is active"
    )
    
    def __repr__(self):
        """String representation of the User model."""
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
