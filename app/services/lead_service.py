"""
Business logic for lead management.
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.lead import Lead
from app.models.user import User, UserRole
from app.crud import lead as lead_crud
from app.schemas.lead import LeadCreate, LeadUpdate, LeadNoteCreate


def can_user_access_lead(user: User, lead: Lead) -> bool:
    """
    Check if user can access a specific lead.
    
    Rules:
    - Admin & Manager: Can access all leads
    - Sales: Can only access assigned leads
    
    Args:
        user: Current user
        lead: Lead to check access for
        
    Returns:
        bool: True if user can access lead
    """
    # Admin and Manager can access all leads
    if user.role in [UserRole.ADMIN, UserRole.MANAGER]:
        return True
    
    # Sales can only access assigned leads
    if user.role == UserRole.SALES:
        return lead.assigned_to_id == user.id
    
    return False


def can_user_modify_lead(user: User, lead: Lead) -> bool:
    """
    Check if user can modify a specific lead.
    
    Rules:
    - Admin & Manager: Can modify all leads
    - Sales: Can only modify assigned leads
    
    Args:
        user: Current user
        lead: Lead to check modification rights for
        
    Returns:
        bool: True if user can modify lead
    """
    return can_user_access_lead(user, lead)


def can_user_delete_lead(user: User) -> bool:
    """
    Check if user can delete leads.
    
    Rules:
    - Admin & Manager: Can delete leads
    - Sales: Cannot delete leads
    
    Args:
        user: Current user
        
    Returns:
        bool: True if user can delete leads
    """
    return user.role in [UserRole.ADMIN, UserRole.MANAGER]


def can_user_assign_lead(user: User) -> bool:
    """
    Check if user can assign leads.
    
    Rules:
    - Admin & Manager: Can assign leads
    - Sales: Cannot assign leads
    
    Args:
        user: Current user
        
    Returns:
        bool: True if user can assign leads
    """
    return user.role in [UserRole.ADMIN, UserRole.MANAGER]


def validate_lead_assignment(db: Session, assigned_to_id: int) -> None:
    """
    Validate that the user being assigned to has sales role.
    
    Args:
        db: Database session
        assigned_to_id: User ID to assign to
        
    Raises:
        HTTPException: If user doesn't exist or doesn't have sales role
    """
    from app.crud import user as user_crud
    
    user = user_crud.get_user(db, user_id=assigned_to_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.role not in [UserRole.SALES, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only assign leads to Sales or Manager users"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot assign to inactive user"
        )


def create_lead_with_validation(
    db: Session,
    lead: LeadCreate,
    current_user: User
) -> Lead:
    """
    Create a lead with business logic validation.
    
    Args:
        db: Database session
        lead: Lead creation data
        current_user: User creating the lead
        
    Returns:
        Created Lead object
        
    Raises:
        HTTPException: If validation fails
    """
    # Validate assignment if provided
    if lead.assigned_to_id:
        validate_lead_assignment(db, lead.assigned_to_id)
    
    # Create lead
    return lead_crud.create_lead(db, lead, created_by_id=current_user.id)


def get_leads_for_user(
    db: Session,
    user: User,
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    source: str = None,
    search: str = None
):
    """
    Get leads based on user permissions.
    
    Args:
        db: Database session
        user: Current user
        skip: Pagination skip
        limit: Pagination limit
        status: Filter by status
        source: Filter by source
        search: Search term
        
    Returns:
        Tuple of (leads, total)
    """
    # Admin and Manager see all leads
    if user.role in [UserRole.ADMIN, UserRole.MANAGER]:
        return lead_crud.get_leads(
            db,
            skip=skip,
            limit=limit,
            status=status,
            source=source,
            search=search
        )
    
    # Sales only see assigned leads
    return lead_crud.get_leads(
        db,
        skip=skip,
        limit=limit,
        status=status,
        source=source,
        search=search,
        assigned_to_id=user.id
    )
