"""
Pydantic schemas for Task model validation and serialization.
"""
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field

from app.models.task import TaskPriority, TaskStatus, RelatedEntityType


# ========== Task Schemas ==========

class TaskBase(BaseModel):
    """
    Base task schema with common fields.
    """
    title: str = Field(..., min_length=1, max_length=255, description="Task title")
    description: Optional[str] = Field(None, description="Task description")
    assigned_to_id: int = Field(..., description="Assigned user ID")
    related_type: Optional[RelatedEntityType] = Field(None, description="Related entity type")
    related_id: Optional[int] = Field(None, description="Related entity ID")
    due_date: Optional[date] = Field(None, description="Task due date")
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM, description="Task priority")
    status: TaskStatus = Field(default=TaskStatus.PENDING, description="Task status")


class TaskCreate(TaskBase):
    """
    Schema for creating a new task.
    """
    pass


class TaskUpdate(BaseModel):
    """
    Schema for updating an existing task.
    All fields are optional.
    """
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    assigned_to_id: Optional[int] = None
    related_type: Optional[RelatedEntityType] = None
    related_id: Optional[int] = None
    due_date: Optional[date] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None


class TaskStatusUpdate(BaseModel):
    """
    Schema for updating task status.
    """
    status: TaskStatus = Field(..., description="New status")


class TaskAssign(BaseModel):
    """
    Schema for assigning a task to a user.
    """
    assigned_to_id: int = Field(..., description="User ID to assign task to")


# Simplified user info for responses
class UserInfo(BaseModel):
    """User information for task responses."""
    id: int
    email: str
    full_name: str
    
    model_config = {
        "from_attributes": True
    }


class TaskResponse(TaskBase):
    """
    Schema for task responses.
    Includes all base fields plus relationships and timestamps.
    """
    id: int
    created_by_id: int
    created_at: datetime
    updated_at: datetime
    is_overdue: bool = Field(..., description="Whether task is overdue")
    
    # Relationships
    assigned_to: UserInfo
    created_by: UserInfo
    
    model_config = {
        "from_attributes": True
    }


# ========== List/Pagination Schemas ==========

class TaskListResponse(BaseModel):
    """
    Schema for paginated task list response.
    """
    total: int = Field(..., description="Total number of tasks")
    skip: int = Field(..., description="Number of skipped records")
    limit: int = Field(..., description="Number of records per page")
    tasks: List[TaskResponse] = Field(..., description="List of tasks")
