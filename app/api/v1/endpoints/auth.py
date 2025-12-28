"""
Authentication endpoints for user registration, login, and token management.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    Token,
    TokenRefresh,
    UserInfo
)
from app.services import auth_service
from app.models.user import User


router = APIRouter()


@router.post("/register", response_model=UserInfo, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    """
    Register a new user.
    
    - **email**: Unique email address
    - **full_name**: User's full name
    - **password**: Password (minimum 8 characters)
    - **role**: User role (admin, manager, sales)
    
    Returns the created user information (without password).
    """
    user = auth_service.register_user(db=db, user_data=user_data)
    return user


@router.post("/login", response_model=Token)
def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Login with email and password.
    
    - **email**: User's email address
    - **password**: User's password
    
    Returns access token and refresh token.
    The access token should be included in the Authorization header for protected routes.
    """
    # Authenticate user
    user = auth_service.authenticate_user(
        db=db,
        email=credentials.email,
        password=credentials.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )
    
    # Create tokens
    tokens = auth_service.create_tokens_for_user(user)
    
    return Token(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type="bearer"
    )


@router.post("/refresh", response_model=Token)
def refresh_token(
    refresh_data: TokenRefresh,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token.
    
    - **refresh_token**: Valid refresh token
    
    Returns new access token and refresh token.
    Use this when the access token expires to get a new one.
    """
    # Verify refresh token and get user
    user = auth_service.verify_refresh_token(db=db, refresh_token=refresh_data.refresh_token)
    
    # Create new tokens
    tokens = auth_service.create_tokens_for_user(user)
    
    return Token(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type="bearer"
    )


@router.get("/me", response_model=UserInfo)
def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current authenticated user's information.
    
    Requires: Valid access token in Authorization header.
    
    Returns the currently logged-in user's information.
    """
    return current_user
