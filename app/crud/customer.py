"""
CRUD operations for Customer model.
"""
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.customer import Customer, CustomerInteraction, InteractionType
from app.models.lead import Lead, LeadStatus
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerInteractionCreate


def create_customer(db: Session, customer: CustomerCreate, created_by_id: int) -> Customer:
    """
    Create a new customer.
    
    Args:
        db: Database session
        customer: Customer creation schema
        created_by_id: ID of user creating the customer
        
    Returns:
        Created Customer object
    """
    db_customer = Customer(
        full_name=customer.full_name,
        email=customer.email,
        phone=customer.phone,
        company=customer.company,
        assigned_to_id=customer.assigned_to_id,
        created_by_id=created_by_id
    )
    
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    
    return db_customer


def get_customer(db: Session, customer_id: int) -> Optional[Customer]:
    """
    Get a customer by ID.
    
    Args:
        db: Database session
        customer_id: Customer ID
        
    Returns:
        Customer object if found, None otherwise
    """
    return db.query(Customer).filter(Customer.id == customer_id).first()


def get_customers(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    assigned_to_id: Optional[int] = None,
    search: Optional[str] = None
) -> Tuple[List[Customer], int]:
    """
    Get a list of customers with filters and pagination.
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        assigned_to_id: Filter by assigned user
        search: Search in name, email, and company
        
    Returns:
        Tuple of (list of customers, total count)
    """
    query = db.query(Customer)
    
    # Apply filters
    if assigned_to_id:
        query = query.filter(Customer.assigned_to_id == assigned_to_id)
    
    if search:
        search_filter = or_(
            Customer.full_name.ilike(f"%{search}%"),
            Customer.email.ilike(f"%{search}%"),
            Customer.company.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Get total count before pagination
    total = query.count()
    
    # Apply pagination and ordering
    customers = query.order_by(Customer.created_at.desc()).offset(skip).limit(limit).all()
    
    return customers, total


def update_customer(db: Session, customer_id: int, customer_update: CustomerUpdate) -> Optional[Customer]:
    """
    Update an existing customer.
    
    Args:
        db: Database session
        customer_id: Customer ID to update
        customer_update: Customer update schema
        
    Returns:
        Updated Customer object if found, None otherwise
    """
    db_customer = get_customer(db, customer_id)
    
    if not db_customer:
        return None
    
    # Update fields if provided
    update_data = customer_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_customer, field, value)
    
    db.commit()
    db.refresh(db_customer)
    
    return db_customer


def delete_customer(db: Session, customer_id: int) -> bool:
    """
    Delete a customer.
    
    Args:
        db: Database session
        customer_id: Customer ID to delete
        
    Returns:
        True if deleted, False if not found
    """
    db_customer = get_customer(db, customer_id)
    
    if not db_customer:
        return False
    
    db.delete(db_customer)
    db.commit()
    
    return True


def convert_lead_to_customer(
    db: Session,
    lead_id: int,
    company: Optional[str],
    created_by_id: int
) -> Customer:
    """
    Convert a lead to a customer.
    
    Args:
        db: Database session
        lead_id: Lead ID to convert
        company: Customer's company name
        created_by_id: User performing the conversion
        
    Returns:
        Created Customer object
    """
    # Get the lead
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    
    if not lead:
        raise ValueError("Lead not found")
    
    # Create customer from lead data
    db_customer = Customer(
        full_name=lead.full_name,
        email=lead.email,
        phone=lead.phone,
        company=company,
        lead_id=lead_id,
        assigned_to_id=lead.assigned_to_id,  # Transfer assignment
        created_by_id=created_by_id
    )
    
    db.add(db_customer)
    
    # Update lead status to Won
    lead.status = LeadStatus.WON
    
    db.commit()
    db.refresh(db_customer)
    
    return db_customer


# ========== CustomerInteraction CRUD ==========

def create_customer_interaction(
    db: Session,
    customer_id: int,
    interaction: CustomerInteractionCreate,
    user_id: int
) -> CustomerInteraction:
    """
    Create a customer interaction.
    
    Args:
        db: Database session
        customer_id: Customer ID
        interaction: Interaction creation schema
        user_id: User logging the interaction
        
    Returns:
        Created CustomerInteraction object
    """
    db_interaction = CustomerInteraction(
        customer_id=customer_id,
        user_id=user_id,
        interaction_type=interaction.interaction_type,
        subject=interaction.subject,
        description=interaction.description
    )
    
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    
    return db_interaction


def get_customer_interactions(db: Session, customer_id: int) -> List[CustomerInteraction]:
    """
    Get all interactions for a customer.
    
    Args:
        db: Database session
        customer_id: Customer ID
        
    Returns:
        List of CustomerInteraction objects
    """
    return db.query(CustomerInteraction).filter(
        CustomerInteraction.customer_id == customer_id
    ).order_by(CustomerInteraction.created_at.desc()).all()
