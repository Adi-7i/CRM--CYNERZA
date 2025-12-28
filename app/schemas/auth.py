"""
Pydantic schemas for authentication and authorization.
"""
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole


class UserRegister(BaseModel):
    """
    Schema for user registration.
    """
    email: EmailStr = Field(..., description="User's email address")
    full_name: str = Field(..., min_length=1, max_length=255, description="User's full name")
    password: str = Field(..., min_length=8, max_length=50, description="User's password")
    role: UserRole = Field(default=UserRole.SALES, description="User role")


class UserLogin(BaseModel):
    """
    Schema for user login.
    """
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")


class Token(BaseModel):
    """
    Schema for token response.
    """
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")


class TokenRefresh(BaseModel):
    """
    Schema for refresh token request.
    """
    refresh_token: str = Field(..., description="Refresh token to get new access token")


class TokenData(BaseModel):
    """
    Schema for decoded token data.
    """
    user_id: int
    email: str
    role: UserRole
    exp: Optional[int] = None
    
    
class UserInfo(BaseModel):
    """
    Schema for current user information.
    """
    id: int
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    
    model_config = {
        "from_attributes": True
    }
