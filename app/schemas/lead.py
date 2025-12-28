"""
Pydantic schemas for Lead model validation and serialization.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

from app.models.lead import LeadStatus, LeadSource


# ========== Lead Schemas ==========

class LeadBase(BaseModel):
    """
    Base lead schema with common fields.
    """
    full_name: str = Field(..., min_length=1, max_length=255, description="Lead's full name")
    email: EmailStr = Field(..., description="Lead's email address")
    phone: Optional[str] = Field(None, max_length=20, description="Lead's phone number")
    source: LeadSource = Field(default=LeadSource.OTHER, description="Lead source")
    status: LeadStatus = Field(default=LeadStatus.NEW, description="Lead status")


class LeadCreate(LeadBase):
    """
    Schema for creating a new lead.
    """
    assigned_to_id: Optional[int] = Field(None, description="ID of user to assign lead to")


class LeadUpdate(BaseModel):
    """
    Schema for updating an existing lead.
    All fields are optional.
    """
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    source: Optional[LeadSource] = None
    status: Optional[LeadStatus] = None
    assigned_to_id: Optional[int] = None


class LeadAssign(BaseModel):
    """
    Schema for assigning a lead to a user.
    """
    assigned_to_id: int = Field(..., description="ID of user to assign lead to")


class LeadStatusUpdate(BaseModel):
    """
    Schema for updating lead status.
    """
    status: LeadStatus = Field(..., description="New status")


# Simplified user info for responses
class UserInfo(BaseModel):
    """User information for lead responses."""
    id: int
    email: str
    full_name: str
    
    model_config = {
        "from_attributes": True
    }


class LeadResponse(LeadBase):
    """
    Schema for lead responses.
    Includes all base fields plus relationships and timestamps.
    """
    id: int
    assigned_to_id: Optional[int]
    created_by_id: int
    created_at: datetime
    updated_at: datetime
    
    # Relationships
    assigned_to: Optional[UserInfo] = None
    created_by: UserInfo
    
    model_config = {
        "from_attributes": True
    }


# ========== LeadNote Schemas ==========

class LeadNoteCreate(BaseModel):
    """
    Schema for creating a lead note.
    """
    note_text: str = Field(..., min_length=1, description="Note content")


class LeadNoteResponse(BaseModel):
    """
    Schema for lead note responses.
    """
    id: int
    lead_id: int
    user_id: int
    note_text: str
    created_at: datetime
    
    # Relationship
    user: UserInfo
    
    model_config = {
        "from_attributes": True
    }


# ========== List/Pagination Schemas ==========

class LeadListResponse(BaseModel):
    """
    Schema for paginated lead list response.
    """
    total: int = Field(..., description="Total number of leads")
    skip: int = Field(..., description="Number of skipped records")
    limit: int = Field(..., description="Number of records per page")
    leads: List[LeadResponse] = Field(..., description="List of leads")
