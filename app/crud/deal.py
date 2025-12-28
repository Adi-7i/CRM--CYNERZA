"""
CRUD operations for Deal model.
"""
from typing import Optional, List, Tuple, Dict
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from decimal import Decimal
from collections import defaultdict

from app.models.deal import Deal, DealStage
from app.schemas.deal import DealCreate, DealUpdate


def create_deal(db: Session, deal: DealCreate, owner_id: int) -> Deal:
    """
    Create a new deal.
    
    Args:
        db: Database session
        deal: Deal creation schema
        owner_id: ID of deal owner (defaults to creator if not specified)
        
    Returns:
        Created Deal object
    """
    db_deal = Deal(
        title=deal.title,
        customer_id=deal.customer_id,
        owner_id=deal.owner_id or owner_id,  # Use provided owner or default to creator
        stage=deal.stage,
        value=deal.value,
        probability=deal.probability,
        expected_close_date=deal.expected_close_date
    )
    
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    
    return db_deal


def get_deal(db: Session, deal_id: int) -> Optional[Deal]:
    """
    Get a deal by ID.
    
    Args:
        db: Database session
        deal_id: Deal ID
        
    Returns:
        Deal object if found, None otherwise
    """
    return db.query(Deal).filter(Deal.id == deal_id).first()


def get_deals(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    stage: Optional[DealStage] = None,
    customer_id: Optional[int] = None,
    owner_id: Optional[int] = None,
    search: Optional[str] = None
) -> Tuple[List[Deal], int]:
    """
    Get a list of deals with filters and pagination.
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        stage: Filter by stage
        customer_id: Filter by customer
        owner_id: Filter by owner
        search: Search in deal title
        
    Returns:
        Tuple of (list of deals, total count)
    """
    query = db.query(Deal)
    
    # Apply filters
    if stage:
        query = query.filter(Deal.stage == stage)
    
    if customer_id:
        query = query.filter(Deal.customer_id == customer_id)
    
    if owner_id:
        query = query.filter(Deal.owner_id == owner_id)
    
    if search:
        search_filter = Deal.title.ilike(f"%{search}%")
        query = query.filter(search_filter)
    
    # Get total count before pagination
    total = query.count()
    
    # Apply pagination and ordering
    deals = query.order_by(Deal.created_at.desc()).offset(skip).limit(limit).all()
    
    return deals, total


def get_pipeline_view(db: Session, owner_id: Optional[int] = None) -> Dict[str, dict]:
    """
    Get pipeline view grouped by stage.
    
    Args:
        db: Database session
        owner_id: Optional filter by owner (for sales users)
        
    Returns:
        Dictionary with deals grouped by stage
    """
    query = db.query(Deal)
    
    # Filter by owner if specified (for sales users)
    if owner_id:
        query = query.filter(Deal.owner_id == owner_id)
    
    # Get all deals
    all_deals = query.all()
    
    # Group by stage
    pipeline = {}
    
    for stage in DealStage:
        stage_deals = [deal for deal in all_deals if deal.stage == stage]
        
        total_value = sum(Decimal(deal.value) for deal in stage_deals)
        weighted_value = sum(deal.weighted_value for deal in stage_deals)
        
        pipeline[stage.value] = {
            "stage": stage,
            "count": len(stage_deals),
            "total_value": total_value,
            "weighted_value": weighted_value,
            "deals": stage_deals
        }
    
    return pipeline


def update_deal(db: Session, deal_id: int, deal_update: DealUpdate) -> Optional[Deal]:
    """
    Update an existing deal.
    
    Args:
        db: Database session
        deal_id: Deal ID to update
        deal_update: Deal update schema
        
    Returns:
        Updated Deal object if found, None otherwise
    """
    db_deal = get_deal(db, deal_id)
    
    if not db_deal:
        return None
    
    # Update fields if provided
    update_data = deal_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_deal, field, value)
    
    db.commit()
    db.refresh(db_deal)
    
    return db_deal


def delete_deal(db: Session, deal_id: int) -> bool:
    """
    Delete a deal.
    
    Args:
        db: Database session
        deal_id: Deal ID to delete
        
    Returns:
        True if deleted, False if not found
    """
    db_deal = get_deal(db, deal_id)
    
    if not db_deal:
        return False
    
    db.delete(db_deal)
    db.commit()
    
    return True


def update_deal_stage(db: Session, deal_id: int, stage: DealStage) -> Optional[Deal]:
    """
    Update deal stage.
    
    Args:
        db: Database session
        deal_id: Deal ID
        stage: New stage
        
    Returns:
        Updated Deal object if found, None otherwise
    """
    db_deal = get_deal(db, deal_id)
    
    if not db_deal:
        return None
    
    db_deal.stage = stage
    
    # Auto-update probability based on stage
    stage_probabilities = {
        DealStage.PROSPECTING: 10,
        DealStage.QUALIFICATION: 25,
        DealStage.PROPOSAL: 50,
        DealStage.NEGOTIATION: 75,
        DealStage.CLOSED_WON: 100,
        DealStage.CLOSED_LOST: 0
    }
    
    db_deal.probability = stage_probabilities.get(stage, db_deal.probability)
    
    db.commit()
    db.refresh(db_deal)
    
    return db_deal


def assign_deal(db: Session, deal_id: int, owner_id: int) -> Optional[Deal]:
    """
    Assign a deal to a user.
    
    Args:
        db: Database session
        deal_id: Deal ID
        owner_id: User ID to assign to
        
    Returns:
        Updated Deal object if found, None otherwise
    """
    db_deal = get_deal(db, deal_id)
    
    if not db_deal:
        return None
    
    db_deal.owner_id = owner_id
    db.commit()
    db.refresh(db_deal)
    
    return db_deal
