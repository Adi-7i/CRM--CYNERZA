"""
Pydantic schemas for Customer model validation and serialization.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

from app.models.customer import InteractionType


# ========== Customer Schemas ==========

class CustomerBase(BaseModel):
    """
    Base customer schema with common fields.
    """
    full_name: str = Field(..., min_length=1, max_length=255, description="Customer's full name")
    email: EmailStr = Field(..., description="Customer's email address")
    phone: Optional[str] = Field(None, max_length=20, description="Customer's phone number")
    company: Optional[str] = Field(None, max_length=255, description="Customer's company name")


class CustomerCreate(CustomerBase):
    """
    Schema for creating a new customer.
    """
    assigned_to_id: Optional[int] = Field(None, description="ID of user to assign customer to")


class CustomerUpdate(BaseModel):
    """
    Schema for updating an existing customer.
    All fields are optional.
    """
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    company: Optional[str] = Field(None, max_length=255)
    assigned_to_id: Optional[int] = None


class LeadToCustomerConvert(BaseModel):
    """
    Schema for converting a lead to a customer.
    """
    lead_id: int = Field(..., description="Lead ID to convert")
    company: Optional[str] = Field(None, max_length=255, description="Customer's company name")


# Simplified user info for responses
class UserInfo(BaseModel):
    """User information for customer responses."""
    id: int
    email: str
    full_name: str
    
    model_config = {
        "from_attributes": True
    }


# Simplified lead info for responses
class LeadInfo(BaseModel):
    """Lead information for customer responses."""
    id: int
    full_name: str
    email: str
    status: str
    
    model_config = {
        "from_attributes": True
    }


class CustomerResponse(CustomerBase):
    """
    Schema for customer responses.
    Includes all base fields plus relationships and timestamps.
    """
    id: int
    lead_id: Optional[int]
    assigned_to_id: Optional[int]
    created_by_id: int
    created_at: datetime
    updated_at: datetime
    
    # Relationships
    assigned_to: Optional[UserInfo] = None
    created_by: UserInfo
    lead: Optional[LeadInfo] = None
    
    model_config = {
        "from_attributes": True
    }


# ========== CustomerInteraction Schemas ==========

class CustomerInteractionCreate(BaseModel):
    """
    Schema for creating a customer interaction.
    """
    interaction_type: InteractionType = Field(..., description="Type of interaction")
    subject: Optional[str] = Field(None, max_length=255, description="Interaction subject")
    description: str = Field(..., min_length=1, description="Interaction details")


class CustomerInteractionResponse(BaseModel):
    """
    Schema for customer interaction responses.
    """
    id: int
    customer_id: int
    user_id: int
    interaction_type: InteractionType
    subject: Optional[str]
    description: str
    created_at: datetime
    
    # Relationship
    user: UserInfo
    
    model_config = {
        "from_attributes": True
    }


# ========== List/Pagination Schemas ==========

class CustomerListResponse(BaseModel):
    """
    Schema for paginated customer list response.
    """
    total: int = Field(..., description="Total number of customers")
    skip: int = Field(..., description="Number of skipped records")
    limit: int = Field(..., description="Number of records per page")
    customers: List[CustomerResponse] = Field(..., description="List of customers")
