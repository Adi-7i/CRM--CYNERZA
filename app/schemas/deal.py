"""
Pydantic schemas for Deal model validation and serialization.
"""
from datetime import datetime, date
from typing import Optional, List, Dict
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator

from app.models.deal import DealStage


# ========== Deal Schemas ==========

class DealBase(BaseModel):
    """
    Base deal schema with common fields.
    """
    title: str = Field(..., min_length=1, max_length=255, description="Deal title")
    customer_id: int = Field(..., description="Customer ID")
    value: Decimal = Field(..., gt=0, description="Deal value")
    stage: DealStage = Field(default=DealStage.PROSPECTING, description="Deal stage")
    probability: int = Field(default=50, ge=0, le=100, description="Win probability (0-100)")
    expected_close_date: Optional[date] = Field(None, description="Expected closing date")


class DealCreate(DealBase):
    """
    Schema for creating a new deal.
    """
    owner_id: Optional[int] = Field(None, description="Deal owner ID (defaults to current user)")


class DealUpdate(BaseModel):
    """
    Schema for updating an existing deal.
    All fields are optional.
    """
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    customer_id: Optional[int] = None
    value: Optional[Decimal] = Field(None, gt=0)
    stage: Optional[DealStage] = None
    probability: Optional[int] = Field(None, ge=0, le=100)
    expected_close_date: Optional[date] = None
    owner_id: Optional[int] = None


class DealStageUpdate(BaseModel):
    """
    Schema for updating deal stage.
    """
    stage: DealStage = Field(..., description="New stage")


class DealAssign(BaseModel):
    """
    Schema for assigning a deal to a user.
    """
    owner_id: int = Field(..., description="User ID to assign deal to")


# Simplified info schemas for responses
class UserInfo(BaseModel):
    """User information for deal responses."""
    id: int
    email: str
    full_name: str
    
    model_config = {
        "from_attributes": True
    }


class CustomerInfo(BaseModel):
    """Customer information for deal responses."""
    id: int
    full_name: str
    email: str
    company: Optional[str]
    
    model_config = {
        "from_attributes": True
    }


class DealResponse(DealBase):
    """
    Schema for deal responses.
    Includes all base fields plus relationships and timestamps.
    """
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    
    # Relationships
    customer: CustomerInfo
    owner: UserInfo
    
    # Computed field
    weighted_value: Optional[Decimal] = Field(None, description="Value * probability")
    
    model_config = {
        "from_attributes": True
    }


# ========== Pipeline & List Schemas ==========

class PipelineStageData(BaseModel):
    """
    Schema for a single stage in the pipeline view.
    """
    stage: DealStage
    count: int = Field(..., description="Number of deals in this stage")
    total_value: Decimal = Field(..., description="Sum of all deal values in this stage")
    weighted_value: Decimal = Field(..., description="Sum of weighted values")
    deals: List[DealResponse] = Field(..., description="List of deals in this stage")


class PipelineViewResponse(BaseModel):
    """
    Schema for pipeline view response (Kanban board data).
    Groups deals by stage.
    """
    pipeline: Dict[str, PipelineStageData] = Field(..., description="Deals grouped by stage")
    total_deals: int = Field(..., description="Total number of deals")
    total_value: Decimal = Field(..., description="Sum of all deal values")
    total_weighted_value: Decimal = Field(..., description="Sum of all weighted values")


class DealListResponse(BaseModel):
    """
    Schema for paginated deal list response.
    """
    total: int = Field(..., description="Total number of deals")
    skip: int = Field(..., description="Number of skipped records")
    limit: int = Field(..., description="Number of records per page")
    deals: List[DealResponse] = Field(..., description="List of deals")
