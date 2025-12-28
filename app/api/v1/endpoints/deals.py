"""
Deal/Opportunity management endpoints.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from decimal import Decimal

from app.api.deps import get_db, get_current_active_user
from app.core.permissions import require_admin_or_manager
from app.models.user import User
from app.models.deal import DealStage
from app.schemas.deal import (
    DealCreate,
    DealUpdate,
    DealResponse,
    DealStageUpdate,
    DealAssign,
    DealListResponse,
    PipelineViewResponse,
    PipelineStageData
)
from app.crud import deal as deal_crud
from app.services import deal_service


router = APIRouter()


@router.post("/", response_model=DealResponse, status_code=status.HTTP_201_CREATED)
def create_deal(
    deal_in: DealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new deal.
    
    **Permissions**: All authenticated users can create deals.
    
    - **title**: Deal title
    - **customer_id**: Customer ID (must exist)
    - **value**: Deal value (must be positive)
    - **stage**: Initial stage (default: Prospecting)
    - **probability**: Win probability 0-100 (default: 50)
    - **expected_close_date**: Expected closing date (optional)
    - **owner_id**: Deal owner ID (defaults to current user if not specified)
    """
    deal = deal_service.create_deal_with_validation(db, deal_in, current_user)
    return deal


@router.get("/pipeline", response_model=PipelineViewResponse)
def get_pipeline(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get pipeline view (Kanban board data).
    
    **Permissions**:
    - Admin & Manager: See all deals grouped by stage
    - Sales: See only own deals grouped by stage
    
    Returns deals grouped by stage with metrics:
    - Count of deals per stage
    - Total value per stage
    - Weighted value per stage (value * probability)
    """
    # Get owner filter based on user role
    from app.models.user import UserRole
    owner_id = None if current_user.role in [UserRole.ADMIN, UserRole.MANAGER] else current_user.id
    
    # Get pipeline data
    pipeline_data = deal_crud.get_pipeline_view(db, owner_id=owner_id)
    
    # Calculate totals
    total_deals = sum(stage_data["count"] for stage_data in pipeline_data.values())
    total_value = sum(stage_data["total_value"] for stage_data in pipeline_data.values())
    total_weighted_value = sum(stage_data["weighted_value"] for stage_data in pipeline_data.values())
    
    # Format response
    pipeline_formatted = {
        stage_name: PipelineStageData(**stage_data)
        for stage_name, stage_data in pipeline_data.items()
    }
    
    return PipelineViewResponse(
        pipeline=pipeline_formatted,
        total_deals=total_deals,
        total_value=total_value,
        total_weighted_value=total_weighted_value
    )


@router.get("/", response_model=DealListResponse)
def list_deals(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum records to return"),
    stage: Optional[DealStage] = Query(None, description="Filter by stage"),
    customer_id: Optional[int] = Query(None, description="Filter by customer"),
    search: Optional[str] = Query(None, description="Search in deal title"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    List deals with filters and pagination.
    
    **Permissions**:
    - Admin & Manager: See all deals
    - Sales: See only own deals
    
    **Filters**:
    - stage: Filter by deal stage
    - customer_id: Filter by customer
    - search: Search in deal title
    
    **Pagination**:
    - skip: Number of records to skip (default: 0)
    - limit: Max records to return (default: 100, max: 500)
    """
    deals, total = deal_service.get_deals_for_user(
        db=db,
        user=current_user,
        skip=skip,
        limit=limit,
        stage=stage,
        customer_id=customer_id,
        search=search
    )
    
    return DealListResponse(
        total=total,
        skip=skip,
        limit=limit,
        deals=deals
    )


@router.get("/{deal_id}", response_model=DealResponse)
def get_deal(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific deal by ID.
    
    **Permissions**:
    - Admin & Manager: Can view any deal
    - Sales: Can only view own deals
    
    Returns deal details including relationships (customer, owner).
    """
    deal = deal_crud.get_deal(db, deal_id=deal_id)
    
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found"
        )
    
    # Check permissions
    if not deal_service.can_user_access_deal(current_user, deal):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this deal"
        )
    
    return deal


@router.put("/{deal_id}", response_model=DealResponse)
def update_deal(
    deal_id: int,
    deal_in: DealUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update an existing deal.
    
    **Permissions**:
    - Admin & Manager: Can update any deal
    - Sales: Can only update own deals
    
    All fields are optional - only provided fields will be updated.
    """
    deal = deal_crud.get_deal(db, deal_id=deal_id)
    
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found"
        )
    
    # Check permissions
    if not deal_service.can_user_modify_deal(current_user, deal):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to modify this deal"
        )
    
    # Validate customer if being updated
    if deal_in.customer_id is not None:
        deal_service.validate_customer_exists(db, deal_in.customer_id)
    
    # Validate owner if being updated
    if deal_in.owner_id is not None:
        deal_service.validate_deal_owner(db, deal_in.owner_id)
    
    updated_deal = deal_crud.update_deal(db, deal_id=deal_id, deal_update=deal_in)
    return updated_deal


@router.delete("/{deal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deal(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """
    Delete a deal.
    
    **Requires**: Admin or Manager role
    """
    success = deal_crud.delete_deal(db, deal_id=deal_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found"
        )
    
    return None


@router.put("/{deal_id}/stage", response_model=DealResponse)
def update_deal_stage(
    deal_id: int,
    stage_update: DealStageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update deal stage.
    
    **Permissions**:
    - Admin & Manager: Can update any deal stage
    - Sales: Can only update stage of own deals
    
    Automatically updates probability based on stage:
    - Prospecting: 10%
    - Qualification: 25%
    - Proposal: 50%
    - Negotiation: 75%
    - Closed_Won: 100%
    - Closed_Lost: 0%
    """
    deal = deal_crud.get_deal(db, deal_id=deal_id)
    
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found"
        )
    
    # Check permissions
    if not deal_service.can_user_modify_deal(current_user, deal):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to modify this deal"
        )
    
    updated_deal = deal_crud.update_deal_stage(db, deal_id=deal_id, stage=stage_update.stage)
    
    return updated_deal


@router.post("/{deal_id}/assign", response_model=DealResponse)
def assign_deal(
    deal_id: int,
    assign_data: DealAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """
    Assign a deal to a user.
    
    **Requires**: Admin or Manager role
    
    Only sales or manager users can be assigned deals.
    """
    deal = deal_crud.get_deal(db, deal_id=deal_id)
    
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found"
        )
    
    # Validate owner
    deal_service.validate_deal_owner(db, assign_data.owner_id)
    
    # Assign deal
    updated_deal = deal_crud.assign_deal(db, deal_id=deal_id, owner_id=assign_data.owner_id)
    
    return updated_deal
