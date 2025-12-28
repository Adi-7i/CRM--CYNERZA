"""
Business logic for customer management.
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.customer import Customer
from app.models.user import User, UserRole
from app.models.lead import Lead, LeadStatus
from app.crud import customer as customer_crud
from app.crud import lead as lead_crud
from app.schemas.customer import CustomerCreate, LeadToCustomerConvert


def can_user_access_customer(user: User, customer: Customer) -> bool:
    """
    Check if user can access a specific customer.
    
    Rules:
    - Admin & Manager: Can access all customers
    - Sales: Can only access assigned customers
    
    Args:
        user: Current user
        customer: Customer to check access for
        
    Returns:
        bool: True if user can access customer
    """
    # Admin and Manager can access all customers
    if user.role in [UserRole.ADMIN, UserRole.MANAGER]:
        return True
    
    # Sales can only access assigned customers
    if user.role == UserRole.SALES:
        return customer.assigned_to_id == user.id
    
    return False


def can_user_modify_customer(user: User, customer: Customer) -> bool:
    """
    Check if user can modify a specific customer.
    
    Rules:
    - Admin & Manager: Can modify all customers
    - Sales: Can only modify assigned customers
    
    Args:
        user: Current user
        customer: Customer to check modification rights for
        
    Returns:
        bool: True if user can modify customer
    """
    return can_user_access_customer(user, customer)


def can_user_delete_customer(user: User) -> bool:
    """
    Check if user can delete customers.
    
    Rules:
    - Admin & Manager: Can delete customers
    - Sales: Cannot delete customers
    
    Args:
        user: Current user
        
    Returns:
        bool: True if user can delete customers
    """
    return user.role in [UserRole.ADMIN, UserRole.MANAGER]


def validate_customer_assignment(db: Session, assigned_to_id: int) -> None:
    """
    Validate that the assigned user exists and has appropriate role.
    
    Args:
        db: Database session
        assigned_to_id: User ID to assign to
        
    Raises:
        HTTPException: If user doesn't exist or doesn't have appropriate role
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
            detail="Can only assign customers to Sales or Manager users"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot assign to inactive user"
        )


def create_customer_with_validation(
    db: Session,
    customer: CustomerCreate,
    current_user: User
) -> Customer:
    """
    Create a customer with business logic validation.
    
    Args:
        db: Database session
        customer: Customer creation data
        current_user: User creating the customer
        
    Returns:
        Created Customer object
        
    Raises:
        HTTPException: If validation fails
    """
    # Validate assignment if provided
    if customer.assigned_to_id:
        validate_customer_assignment(db, customer.assigned_to_id)
    
    # Create customer
    return customer_crud.create_customer(db, customer, created_by_id=current_user.id)


def convert_lead_to_customer_with_validation(
    db: Session,
    conversion_data: LeadToCustomerConvert,
    current_user: User
) -> Customer:
    """
    Convert a lead to a customer with validation.
    
    Args:
        db: Database session
        conversion_data: Conversion request data
        current_user: User performing the conversion
        
    Returns:
        Created Customer object
        
    Raises:
        HTTPException: If validation fails
    """
    # Get the lead
    lead = lead_crud.get_lead(db, lead_id=conversion_data.lead_id)
    
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    # Check if lead is already converted
    existing_customer = db.query(Customer).filter(Customer.lead_id == conversion_data.lead_id).first()
    if existing_customer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Lead already converted to customer (Customer ID: {existing_customer.id})"
        )
    
    # Check if lead status is appropriate for conversion
    # Typically convert qualified, proposal, or won leads
    if lead.status not in [LeadStatus.QUALIFIED, LeadStatus.PROPOSAL, LeadStatus.WON]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot convert lead with status '{lead.status.value}'. Lead should be Qualified, Proposal, or Won."
        )
    
    # Perform conversion
    customer = customer_crud.convert_lead_to_customer(
        db=db,
        lead_id=conversion_data.lead_id,
        company=conversion_data.company,
        created_by_id=current_user.id
    )
    
    # Copy lead notes to customer interactions
    lead_notes = lead_crud.get_lead_notes(db, lead_id=conversion_data.lead_id)
    for note in lead_notes:
        from app.models.customer import InteractionType
        from app.schemas.customer import CustomerInteractionCreate
        
        interaction = CustomerInteractionCreate(
            interaction_type=InteractionType.NOTE,
            subject="Migrated from lead notes",
            description=note.note_text
        )
        
        customer_crud.create_customer_interaction(
            db=db,
            customer_id=customer.id,
            interaction=interaction,
            user_id=note.user_id
        )
    
    return customer


def get_customers_for_user(
    db: Session,
    user: User,
    skip: int = 0,
    limit: int = 100,
    search: str = None
):
    """
    Get customers based on user permissions.
    
    Args:
        db: Database session
        user: Current user
        skip: Pagination skip
        limit: Pagination limit
        search: Search term
        
    Returns:
        Tuple of (customers, total)
    """
    # Admin and Manager see all customers
    if user.role in [UserRole.ADMIN, UserRole.MANAGER]:
        return customer_crud.get_customers(
            db,
            skip=skip,
            limit=limit,
            search=search
        )
    
    # Sales only see assigned customers
    return customer_crud.get_customers(
        db,
        skip=skip,
        limit=limit,
        search=search,
        assigned_to_id=user.id
    )
