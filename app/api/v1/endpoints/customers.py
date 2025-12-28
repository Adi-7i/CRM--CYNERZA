"""
Customer management endpoints.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.core.permissions import require_admin_or_manager
from app.models.user import User
from app.schemas.customer import (
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse,
    LeadToCustomerConvert,
    CustomerInteractionCreate,
    CustomerInteractionResponse,
    CustomerListResponse
)
from app.crud import customer as customer_crud
from app.services import customer_service


router = APIRouter()


@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    customer_in: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new customer.
    
    **Permissions**: All authenticated users can create customers.
    
    - **full_name**: Customer's full name
    - **email**: Customer's email address
    - **phone**: Customer's phone number (optional)
    - **company**: Company name (optional)
    - **assigned_to_id**: ID of user to assign to (optional)
    """
    customer = customer_service.create_customer_with_validation(db, customer_in, current_user)
    return customer


@router.post("/convert-lead", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def convert_lead(
    conversion_data: LeadToCustomerConvert,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """
    Convert a lead to a customer.
    
    **Requires**: Admin or Manager role
    
    This endpoint:
    - Creates a customer from lead data
    - Sets lead status to "Won"
    - Transfers assignment from lead to customer
    - Migrates all lead notes to customer interactions
    
    - **lead_id**: ID of the lead to convert
    - **company**: Customer's company name (optional, can be added if not in lead)
    """
    customer = customer_service.convert_lead_to_customer_with_validation(
        db, conversion_data, current_user
    )
    return customer


@router.get("/", response_model=CustomerListResponse)
def list_customers(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum records to return"),
    search: Optional[str] = Query(None, description="Search in name, email, and company"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    List customers with filters and pagination.
    
    **Permissions**:
    - Admin & Manager: See all customers
    - Sales: See only assigned customers
    
    **Filters**:
    - search: Search in name, email, and company
    
    **Pagination**:
    - skip: Number of records to skip (default: 0)
    - limit: Max records to return (default: 100, max: 500)
    """
    customers, total = customer_service.get_customers_for_user(
        db=db,
        user=current_user,
        skip=skip,
        limit=limit,
        search=search
    )
    
    return CustomerListResponse(
        total=total,
        skip=skip,
        limit=limit,
        customers=customers
    )


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific customer by ID.
    
    **Permissions**:
    - Admin & Manager: Can view any customer
    - Sales: Can only view assigned customers
    
    Returns customer details including relationships (assigned_to, created_by, lead).
    """
    customer = customer_crud.get_customer(db, customer_id=customer_id)
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Check permissions
    if not customer_service.can_user_access_customer(current_user, customer):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this customer"
        )
    
    return customer


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int,
    customer_in: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update an existing customer.
    
    **Permissions**:
    - Admin & Manager: Can update any customer
    - Sales: Can only update assigned customers
    
    All fields are optional - only provided fields will be updated.
    """
    customer = customer_crud.get_customer(db, customer_id=customer_id)
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Check permissions
    if not customer_service.can_user_modify_customer(current_user, customer):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to modify this customer"
        )
    
    # Validate assignment if being updated
    if customer_in.assigned_to_id is not None:
        customer_service.validate_customer_assignment(db, customer_in.assigned_to_id)
    
    updated_customer = customer_crud.update_customer(db, customer_id=customer_id, customer_update=customer_in)
    return updated_customer


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """
    Delete a customer.
    
    **Requires**: Admin or Manager role
    
    This will also delete all associated interactions.
    """
    success = customer_crud.delete_customer(db, customer_id=customer_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    return None


# ========== Customer Interactions Endpoints ==========

@router.post("/{customer_id}/interactions", response_model=CustomerInteractionResponse, status_code=status.HTTP_201_CREATED)
def create_customer_interaction(
    customer_id: int,
    interaction_in: CustomerInteractionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Add an interaction to a customer.
    
    **Permissions**:
    - Admin & Manager: Can add interactions to any customer
    - Sales: Can only add interactions to assigned customers
    
    Interaction types: Call, Email, Meeting, Note
    
    - **interaction_type**: Type of interaction
    - **subject**: Interaction subject (optional)
    - **description**: Interaction details
    """
    customer = customer_crud.get_customer(db, customer_id=customer_id)
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Check permissions
    if not customer_service.can_user_access_customer(current_user, customer):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this customer"
        )
    
    interaction = customer_crud.create_customer_interaction(
        db, customer_id=customer_id, interaction=interaction_in, user_id=current_user.id
    )
    
    return interaction


@router.get("/{customer_id}/interactions", response_model=List[CustomerInteractionResponse])
def get_customer_interactions(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all interactions for a customer.
    
    **Permissions**:
    - Admin & Manager: Can view interactions for any customer
    - Sales: Can only view interactions for assigned customers
    
    Interactions are returned in reverse chronological order (newest first).
    """
    customer = customer_crud.get_customer(db, customer_id=customer_id)
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Check permissions
    if not customer_service.can_user_access_customer(current_user, customer):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this customer"
        )
    
    interactions = customer_crud.get_customer_interactions(db, customer_id=customer_id)
    
    return interactions
