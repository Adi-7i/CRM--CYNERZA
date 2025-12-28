"""
Pydantic schemas for User model validation and serialization.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole


class UserBase(BaseModel):
    """
    Base user schema with common fields.
    """
    email: EmailStr = Field(..., description="User's email address")
    full_name: str = Field(..., min_length=1, max_length=255, description="User's full name")
    role: UserRole = Field(default=UserRole.SALES, description="User role")
    is_active: bool = Field(default=True, description="Whether user is active")


class UserCreate(UserBase):
    """
    Schema for creating a new user.
    Requires password in addition to base fields.
    """
    password: str = Field(..., min_length=8, max_length=50, description="User's password")


class UserUpdate(BaseModel):
    """
    Schema for updating an existing user.
    All fields are optional.
    """
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    password: Optional[str] = Field(None, min_length=8, max_length=50)
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    """
    Schema for user responses.
    Includes all base fields plus id and timestamps.
    Excludes password for security.
    """
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = {
        "from_attributes": True  # Allows creating from ORM models
    }


class UserInDB(UserResponse):
    """
    Schema representing user as stored in database.
    Includes hashed_password for internal use only.
    """
    hashed_password: str
