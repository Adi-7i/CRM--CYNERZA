"""
Common/reusable schemas for the CRM application.
"""
from typing import TypeVar, Generic, List, Optional
from datetime import date
from pydantic import BaseModel, Field

T = TypeVar('T')


class PaginationParams(BaseModel):
    """
    Standard pagination parameters.
    """
    skip: int = Field(default=0, ge=0, description="Number of records to skip")
    limit: int = Field(default=50, ge=1, le=500, description="Maximum records to return")


class DateRangeParams(BaseModel):
    """
    Date range filter parameters.
    """
    start_date: Optional[date] = Field(None, description="Start date for filtering")
    end_date: Optional[date] = Field(None, description="End date for filtering")


class PaginatedResponse(BaseModel, Generic[T]):
    """
    Generic paginated response wrapper.
    """
    total: int = Field(..., description="Total number of records")
    skip: int = Field(..., description="Number of skipped records")
    limit: int = Field(..., description="Maximum records per page")
    items: List[T] = Field(..., description="List of items")
    
    @property
    def has_more(self) -> bool:
        """Check if there are more records after this page."""
        return (self.skip + len(self.items)) < self.total
    
    @property
    def page(self) -> int:
        """Calculate current page number (1-indexed)."""
        if self.limit == 0:
            return 1
        return (self.skip // self.limit) + 1
    
    @property
    def total_pages(self) -> int:
        """Calculate total number of pages."""
        if self.limit == 0:
            return 1
        return (self.total + self.limit - 1) // self.limit


class SuccessResponse(BaseModel):
    """
    Standard success response.
    """
    success: bool = True
    message: str = Field(..., description="Success message")


class ErrorDetail(BaseModel):
    """
    Error detail schema.
    """
    code: str = Field(..., description="Error code")
    message: str = Field(..., description="Error message")
    details: Optional[dict] = Field(None, description="Additional error details")


class ErrorResponse(BaseModel):
    """
    Standard error response.
    """
    success: bool = False
    error: ErrorDetail
    request_id: Optional[str] = Field(None, description="Request ID for tracking")
