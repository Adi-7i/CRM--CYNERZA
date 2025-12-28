"""
User management endpoints.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.permissions import require_admin
from app.crud import user as user_crud
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.models.user import User


router = APIRouter()


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new user.
    
    - **email**: User's email address (must be unique)
    - **full_name**: User's full name
    - **password**: User's password (will be hashed)
    - **role**: User role (admin, manager, sales)
    - **is_active**: Whether the user is active
    """
    # Check if user with this email already exists
    existing_user = user_crud.get_user_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = user_crud.create_user(db=db, user=user_in)
    return user


@router.get("/", response_model=List[UserResponse])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Retrieve a list of users with pagination.
    
    **Requires**: Admin role
    
    - **skip**: Number of records to skip (default: 0)
    - **limit**: Maximum number of records to return (default: 100)
    """
    users = user_crud.get_users(db, skip=skip, limit=limit)
    return users


@router.get("/{user_id}", response_model=UserResponse)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get a specific user by ID.
    
    **Requires**: Admin role
    
    - **user_id**: ID of the user to retrieve
    """
    user = user_crud.get_user(db, user_id=user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Update an existing user.
    
    **Requires**: Admin role
    
    - **user_id**: ID of the user to update
    - All fields are optional
    """
    user = user_crud.update_user(db, user_id=user_id, user_update=user_in)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Delete a user.
    
    **Requires**: Admin role
    
    - **user_id**: ID of the user to delete
    """
    success = user_crud.delete_user(db, user_id=user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return None
