"""
CRUD operations for Lead model.
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.models.lead import Lead, LeadNote, LeadStatus, LeadSource
from app.schemas.lead import LeadCreate, LeadUpdate, LeadNoteCreate


def create_lead(db: Session, lead: LeadCreate, created_by_id: int) -> Lead:
    """
    Create a new lead.
    
    Args:
        db: Database session
        lead: Lead creation schema
        created_by_id: ID of user creating the lead
        
    Returns:
        Created Lead object
    """
    db_lead = Lead(
        full_name=lead.full_name,
        email=lead.email,
        phone=lead.phone,
        source=lead.source,
        status=lead.status,
        assigned_to_id=lead.assigned_to_id,
        created_by_id=created_by_id
    )
    
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    
    return db_lead


def get_lead(db: Session, lead_id: int) -> Optional[Lead]:
    """
    Get a lead by ID.
    
    Args:
        db: Database session
        lead_id: Lead ID
        
    Returns:
        Lead object if found, None otherwise
    """
    return db.query(Lead).filter(Lead.id == lead_id).first()


def get_leads(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[LeadStatus] = None,
    source: Optional[LeadSource] = None,
    assigned_to_id: Optional[int] = None,
    created_by_id: Optional[int] = None,
    search: Optional[str] = None
) -> tuple[List[Lead], int]:
    """
    Get a list of leads with filters and pagination.
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        status: Filter by status
        source: Filter by source
        assigned_to_id: Filter by assigned user
        created_by_id: Filter by creator
        search: Search in name and email
        
    Returns:
        Tuple of (list of leads, total count)
    """
    query = db.query(Lead)
    
    # Apply filters
    if status:
        query = query.filter(Lead.status == status)
    
    if source:
        query = query.filter(Lead.source == source)
    
    if assigned_to_id:
        query = query.filter(Lead.assigned_to_id == assigned_to_id)
    
    if created_by_id:
        query = query.filter(Lead.created_by_id == created_by_id)
    
    if search:
        search_filter = or_(
            Lead.full_name.ilike(f"%{search}%"),
            Lead.email.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Get total count before pagination
    total = query.count()
    
    # Apply pagination and ordering
    leads = query.order_by(Lead.created_at.desc()).offset(skip).limit(limit).all()
    
    return leads, total


def update_lead(db: Session, lead_id: int, lead_update: LeadUpdate) -> Optional[Lead]:
    """
    Update an existing lead.
    
    Args:
        db: Database session
        lead_id: Lead ID to update
        lead_update: Lead update schema
        
    Returns:
        Updated Lead object if found, None otherwise
    """
    db_lead = get_lead(db, lead_id)
    
    if not db_lead:
        return None
    
    # Update fields if provided
    update_data = lead_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_lead, field, value)
    
    db.commit()
    db.refresh(db_lead)
    
    return db_lead


def delete_lead(db: Session, lead_id: int) -> bool:
    """
    Delete a lead.
    
    Args:
        db: Database session
        lead_id: Lead ID to delete
        
    Returns:
        True if deleted, False if not found
    """
    db_lead = get_lead(db, lead_id)
    
    if not db_lead:
        return False
    
    db.delete(db_lead)
    db.commit()
    
    return True


def assign_lead(db: Session, lead_id: int, assigned_to_id: int) -> Optional[Lead]:
    """
    Assign a lead to a user.
    
    Args:
        db: Database session
        lead_id: Lead ID
        assigned_to_id: User ID to assign to
        
    Returns:
        Updated Lead object if found, None otherwise
    """
    db_lead = get_lead(db, lead_id)
    
    if not db_lead:
        return None
    
    db_lead.assigned_to_id = assigned_to_id
    db.commit()
    db.refresh(db_lead)
    
    return db_lead


def update_lead_status(db: Session, lead_id: int, status: LeadStatus) -> Optional[Lead]:
    """
    Update lead status.
    
    Args:
        db: Database session
        lead_id: Lead ID
        status: New status
        
    Returns:
        Updated Lead object if found, None otherwise
    """
    db_lead = get_lead(db, lead_id)
    
    if not db_lead:
        return None
    
    db_lead.status = status
    db.commit()
    db.refresh(db_lead)
    
    return db_lead


# ========== LeadNote CRUD ==========

def create_lead_note(db: Session, lead_id: int, note: LeadNoteCreate, user_id: int) -> LeadNote:
    """
    Create a lead note.
    
    Args:
        db: Database session
        lead_id: Lead ID
        note: Note creation schema
        user_id: User creating the note
        
    Returns:
        Created LeadNote object
    """
    db_note = LeadNote(
        lead_id=lead_id,
        user_id=user_id,
        note_text=note.note_text
    )
    
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    
    return db_note


def get_lead_notes(db: Session, lead_id: int) -> List[LeadNote]:
    """
    Get all notes for a lead.
    
    Args:
        db: Database session
        lead_id: Lead ID
        
    Returns:
        List of LeadNote objects
    """
    return db.query(LeadNote).filter(LeadNote.lead_id == lead_id).order_by(LeadNote.created_at.desc()).all()
