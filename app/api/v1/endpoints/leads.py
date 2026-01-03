"""
Lead management endpoints.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.core.permissions import require_admin_or_manager
from app.models.user import User
from app.models.lead import LeadStatus, LeadSource
from app.schemas.lead import (
    LeadCreate,
    LeadUpdate,
    LeadResponse,
    LeadAssign,
    LeadStatusUpdate,
    LeadNoteCreate,
    LeadNoteResponse,
    LeadListResponse
)
from app.crud import lead as lead_crud
from app.services import lead_service


router = APIRouter()



@router.post("/", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead(
    lead_in: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new lead.
    
    **Permissions**: All authenticated users can create leads.
    
    - **full_name**: Lead's full name
    - **email**: Lead's email address
    - **phone**: Lead's phone number (optional)
    - **source**: Lead source (Website, Referral, Campaign, Direct, Other)
    - **status**: Initial status (default: New)
    - **assigned_to_id**: ID of user to assign to (optional, validates sales role)
    """
    lead = lead_service.create_lead_with_validation(db, lead_in, current_user)
    return lead


@router.get("/", response_model=LeadListResponse)
def list_leads(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum records to return"),
    status: Optional[LeadStatus] = Query(None, description="Filter by status"),
    source: Optional[LeadSource] = Query(None, description="Filter by source"),
    search: Optional[str] = Query(None, description="Search in name and email"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    List leads with filters and pagination.
    
    **Permissions**:
    - Admin & Manager: See all leads
    - Sales: See only assigned leads
    
    **Filters**:
    - status: Filter by lead status
    - source: Filter by lead source
    - search: Search in name and email
    
    **Pagination**:
    - skip: Number of records to skip (default: 0)
    - limit: Max records to return (default: 100, max: 500)
    """
    leads, total = lead_service.get_leads_for_user(
        db=db,
        user=current_user,
        skip=skip,
        limit=limit,
        status=status,
        source=source,
        search=search
    )
    
    return LeadListResponse(
        total=total,
        skip=skip,
        limit=limit,
        leads=leads
    )


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific lead by ID.
    
    **Permissions**:
    - Admin & Manager: Can view any lead
    - Sales: Can only view assigned leads
    
    Returns lead details including relationships (assigned_to, created_by).
    """
    lead = lead_crud.get_lead(db, lead_id=lead_id)
    
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    # Check permissions
    if not lead_service.can_user_access_lead(current_user, lead):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this lead"
        )
    
    return lead


@router.put("/{lead_id}", response_model=LeadResponse)
def update_lead(
    lead_id: int,
    lead_in: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update an existing lead.
    
    **Permissions**:
    - Admin & Manager: Can update any lead
    - Sales: Can only update assigned leads
    
    All fields are optional - only provided fields will be updated.
    """
    lead = lead_crud.get_lead(db, lead_id=lead_id)
    
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    # Check permissions
    if not lead_service.can_user_modify_lead(current_user, lead):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to modify this lead"
        )
    
    # Validate assignment if being updated
    if lead_in.assigned_to_id is not None:
        lead_service.validate_lead_assignment(db, lead_in.assigned_to_id)
    
    updated_lead = lead_crud.update_lead(db, lead_id=lead_id, lead_update=lead_in)
    return updated_lead


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """
    Delete a lead.
    
    **Requires**: Admin or Manager role
    
    This will also delete all associated notes.
    """
    success = lead_crud.delete_lead(db, lead_id=lead_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    return None


@router.post("/{lead_id}/assign", response_model=LeadResponse)
def assign_lead(
    lead_id: int,
    assign_data: LeadAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """
    Assign a lead to a user.
    
    **Requires**: Admin or Manager role
    
    Only sales or manager users can be assigned leads.
    """
    lead = lead_crud.get_lead(db, lead_id=lead_id)
    
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    # Validate assignment
    lead_service.validate_lead_assignment(db, assign_data.assigned_to_id)
    
    # Assign lead
    updated_lead = lead_crud.assign_lead(db, lead_id=lead_id, assigned_to_id=assign_data.assigned_to_id)
    
    return updated_lead


@router.put("/{lead_id}/status", response_model=LeadResponse)
def update_lead_status(
    lead_id: int,
    status_update: LeadStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update lead status.
    
    **Permissions**:
    - Admin & Manager: Can update any lead status
    - Sales: Can only update status of assigned leads
    
    Status values: New, Contacted, Qualified, Proposal, Won, Lost
    """
    lead = lead_crud.get_lead(db, lead_id=lead_id)
    
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    # Check permissions
    if not lead_service.can_user_modify_lead(current_user, lead):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to modify this lead"
        )
    
    updated_lead = lead_crud.update_lead_status(db, lead_id=lead_id, status=status_update.status)
    
    return updated_lead


# ========== Lead Notes Endpoints ==========

@router.post("/{lead_id}/notes", response_model=LeadNoteResponse, status_code=status.HTTP_201_CREATED)
def create_lead_note(
    lead_id: int,
    note_in: LeadNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Add a note to a lead.
    
    **Permissions**:
    - Admin & Manager: Can add notes to any lead
    - Sales: Can only add notes to assigned leads
    
    Notes are used to track activity and interactions with leads.
    """
    lead = lead_crud.get_lead(db, lead_id=lead_id)
    
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    # Check permissions
    if not lead_service.can_user_access_lead(current_user, lead):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this lead"
        )
    
    note = lead_crud.create_lead_note(db, lead_id=lead_id, note=note_in, user_id=current_user.id)
    
    return note


@router.get("/{lead_id}/notes", response_model=List[LeadNoteResponse])
def get_lead_notes(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all notes for a lead.
    
    **Permissions**:
    - Admin & Manager: Can view notes for any lead
    - Sales: Can only view notes for assigned leads
    
    Notes are returned in reverse chronological order (newest first).
    """
    lead = lead_crud.get_lead(db, lead_id=lead_id)
    
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    # Check permissions
    if not lead_service.can_user_access_lead(current_user, lead):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this lead"
        )
    
    notes = lead_crud.get_lead_notes(db, lead_id=lead_id)
    
    return notes
