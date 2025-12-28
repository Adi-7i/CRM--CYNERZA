"""
Authentication service containing business logic for authentication operations.
"""
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.auth import UserRegister
from app.core.security import hash_password, verify_password
from app.core.jwt import create_access_token, create_refresh_token, decode_token, verify_token_type
from app.crud import user as user_crud


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user by email and password.
    
    Args:
        db: Database session
        email: User's email address
        password: Plain-text password
        
    Returns:
        User object if authentication successful, None otherwise
    """
    # Get user by email
    user = user_crud.get_user_by_email(db, email=email)
    
    if not user:
        return None
    
    # Verify password
    if not verify_password(password, user.hashed_password):
        return None
    
    return user


def register_user(db: Session, user_data: UserRegister) -> User:
    """
    Register a new user.
    
    Args:
        db: Database session
        user_data: User registration data
        
    Returns:
        Created User object
        
    Raises:
        HTTPException: If email already exists
    """
    # Check if user with email already exists
    existing_user = user_crud.get_user_by_email(db, email=user_data.email)
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user using CRUD
    from app.schemas.user import UserCreate
    user_create = UserCreate(
        email=user_data.email,
        full_name=user_data.full_name,
        password=user_data.password,
        role=user_data.role,
        is_active=True
    )
    
    user = user_crud.create_user(db=db, user=user_create)
    return user


def create_tokens_for_user(user: User) -> Dict[str, str]:
    """
    Create access and refresh tokens for a user.
    
    Args:
        user: User object
        
    Returns:
        Dictionary with access_token and refresh_token
    """
    # Token payload
    token_data = {
        "user_id": user.id,
        "email": user.email,
        "role": user.role.value
    }
    
    # Create tokens
    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data={"user_id": user.id, "email": user.email})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token
    }


def verify_refresh_token(db: Session, refresh_token: str) -> User:
    """
    Verify refresh token and return user.
    
    Args:
        db: Database session
        refresh_token: Refresh token string
        
    Returns:
        User object
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    try:
        # Decode token
        payload = decode_token(refresh_token)
        
        # Verify it's a refresh token
        if not verify_token_type(payload, "refresh"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        # Get user
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        user = user_crud.get_user(db, user_id=user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return user
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate refresh token: {str(e)}"
        )
