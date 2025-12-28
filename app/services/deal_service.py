"""
Business logic for deal management.
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.deal import Deal
from app.models.user import User, UserRole
from app.crud import deal as deal_crud
from app.crud import customer as customer_crud
from app.schemas.deal import DealCreate


def can_user_access_deal(user: User, deal: Deal) -> bool:
    """
    Check if user can access a specific deal.
    
    Rules:
    - Admin & Manager: Can access all deals
    - Sales: Can only access own deals
    
    Args:
        user: Current user
        deal: Deal to check access for
        
    Returns:
        bool: True if user can access deal
    """
    # Admin and Manager can access all deals
    if user.role in [UserRole.ADMIN, UserRole.MANAGER]:
        return True
    
    # Sales can only access own deals
    if user.role == UserRole.SALES:
        return deal.owner_id == user.id
    
    return False


def can_user_modify_deal(user: User, deal: Deal) -> bool:
    """
    Check if user can modify a specific deal.
    
    Rules:
    - Admin & Manager: Can modify all deals
    - Sales: Can only modify own deals
    
    Args:
        user: Current user
        deal: Deal to check modification rights for
        
    Returns:
        bool: True if user can modify deal
    """
    return can_user_access_deal(user, deal)


def can_user_delete_deal(user: User) -> bool:
    """
    Check if user can delete deals.
    
    Rules:
    - Admin & Manager: Can delete deals
    - Sales: Cannot delete deals
    
    Args:
        user: Current user
        
    Returns:
        bool: True if user can delete deals
    """
    return user.role in [UserRole.ADMIN, UserRole.MANAGER]


def can_user_assign_deal(user: User) -> bool:
    """
    Check if user can assign deals.
    
    Rules:
    - Admin & Manager: Can assign deals
    - Sales: Cannot assign deals
    
    Args:
        user: Current user
        
    Returns:
        bool: True if user can assign deals
    """
    return user.role in [UserRole.ADMIN, UserRole.MANAGER]


def validate_deal_owner(db: Session, owner_id: int) -> None:
    """
    Validate that the deal owner exists and has appropriate role.
    
    Args:
        db: Database session
        owner_id: User ID to assign as owner
        
    Raises:
        HTTPException: If user doesn't exist or doesn't have appropriate role
    """
    from app.crud import user as user_crud
    
    user = user_crud.get_user(db, user_id=owner_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.role not in [UserRole.SALES, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deal owner must be a Sales or Manager user"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot assign to inactive user"
        )


def validate_customer_exists(db: Session, customer_id: int) -> None:
    """
    Validate that the customer exists.
    
    Args:
        db: Database session
        customer_id: Customer ID
        
    Raises:
        HTTPException: If customer doesn't exist
    """
    customer = customer_crud.get_customer(db, customer_id=customer_id)
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )


def create_deal_with_validation(
    db: Session,
    deal: DealCreate,
    current_user: User
) -> Deal:
    """
    Create a deal with business logic validation.
    
    Args:
        db: Database session
        deal: Deal creation data
        current_user: User creating the deal
        
    Returns:
        Created Deal object
        
    Raises:
        HTTPException: If validation fails
    """
    # Validate customer exists
    validate_customer_exists(db, deal.customer_id)
    
    # Validate owner if provided
    if deal.owner_id:
        validate_deal_owner(db, deal.owner_id)
    
    # Create deal (owner_id defaults to current user in CRUD if not provided)
    return deal_crud.create_deal(db, deal, owner_id=current_user.id)


def get_deals_for_user(
    db: Session,
    user: User,
    skip: int = 0,
    limit: int = 100,
    stage: str = None,
    customer_id: int = None,
    search: str = None
):
    """
    Get deals based on user permissions.
    
    Args:
        db: Database session
        user: Current user
        skip: Pagination skip
        limit: Pagination limit
        stage: Filter by stage
        customer_id: Filter by customer
        search: Search term
        
    Returns:
        Tuple of (deals, total)
    """
    # Admin and Manager see all deals
    if user.role in [UserRole.ADMIN, UserRole.MANAGER]:
        return deal_crud.get_deals(
            db,
            skip=skip,
            limit=limit,
            stage=stage,
            customer_id=customer_id,
            search=search
        )
    
    # Sales only see own deals
    return deal_crud.get_deals(
        db,
        skip=skip,
        limit=limit,
        stage=stage,
        customer_id=customer_id,
        search=search,
        owner_id=user.id
    )
