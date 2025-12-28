"""
FastAPI dependencies for dependency injection.
"""
from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jwt.exceptions import InvalidTokenError

from app.core.database import SessionLocal
from app.core.jwt import decode_token, verify_token_type
from app.crud import user as user_crud
from app.models.user import User, UserRole
from app.schemas.auth import TokenData


def get_db() -> Generator[Session, None, None]:
    """
    Dependency that provides a database session for route handlers.
    Automatically closes the session after the request is complete.
    
    Usage:
        @router.get("/items")
        def get_items(db: Session = Depends(get_db)):
            return crud.get_items(db)
    
    Yields:
        Session: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# HTTP Bearer security scheme for JWT tokens
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency that extracts and validates the current user from JWT token.
    
    Args:
        credentials: HTTP Authorization header with Bearer token
        db: Database session
        
    Returns:
        User: Current authenticated user
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Get token from credentials
        token = credentials.credentials
        
        # Decode token
        payload = decode_token(token)
        
        # Verify it's an access token
        if not verify_token_type(payload, "access"):
            raise credentials_exception
        
        # Extract user info from token
        user_id: int = payload.get("user_id")
        email: str = payload.get("email")
        role: str = payload.get("role")
        
        if user_id is None or email is None:
            raise credentials_exception
        
        token_data = TokenData(user_id=user_id, email=email, role=role)
        
    except InvalidTokenError:
        raise credentials_exception
    except Exception:
        raise credentials_exception
    
    # Get user from database
    user = user_crud.get_user(db, user_id=token_data.user_id)
    if user is None:
        raise credentials_exception
    
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency that ensures the current user is active.
    
    Args:
        current_user: User from get_current_user dependency
        
    Returns:
        User: Current active user
        
    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user
