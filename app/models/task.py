"""
Task model for CRM task and follow-up management.
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Date, Enum
from sqlalchemy.orm import relationship
import enum
from datetime import date

from app.models.base import BaseModel


class TaskPriority(str, enum.Enum):
    """
    Task priority enumeration.
    """
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class TaskStatus(str, enum.Enum):
    """
    Task status enumeration.
    """
    PENDING = "Pending"
    COMPLETED = "Completed"
    OVERDUE = "Overdue"


class RelatedEntityType(str, enum.Enum):
    """
    Related entity type for polymorphic relationships.
    """
    LEAD = "lead"
    CUSTOMER = "customer"
    DEAL = "deal"


class Task(BaseModel):
    """
    Task model for managing follow-ups and to-dos.
    Inherits id, created_at, and updated_at from BaseModel.
    
    Supports polymorphic relationships to leads, customers, or deals
    using related_type and related_id fields.
    
    Fields:
        title: Task title
        description: Task description
        assigned_to_id: User assigned to the task
        created_by_id: User who created the task
        related_type: Type of related entity (lead/customer/deal)
        related_id: ID of the related entity
        due_date: Task due date
        priority: Task priority (Low/Medium/High)
        status: Task status (Pending/Completed/Overdue)
        assigned_to: Relationship to User model (assignee)
        created_by: Relationship to User model (creator)
    """
    __tablename__ = "tasks"
    
    # Task information
    title = Column(
        String(255),
        nullable=False,
        comment="Task title"
    )
    
    description = Column(
        Text,
        nullable=True,
        comment="Task description"
    )
    
    # Assignment
    assigned_to_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Assigned user ID"
    )
    
    created_by_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        comment="User who created the task"
    )
    
    # Polymorphic relationship to leads/customers/deals
    related_type = Column(
        Enum(RelatedEntityType),
        nullable=True,
        comment="Type of related entity"
    )
    
    related_id = Column(
        Integer,
        nullable=True,
        comment="ID of the related entity"
    )
    
    # Task details
    due_date = Column(
        Date,
        nullable=True,
        comment="Task due date"
    )
    
    priority = Column(
        Enum(TaskPriority),
        nullable=False,
        default=TaskPriority.MEDIUM,
        index=True,
        comment="Task priority"
    )
    
    status = Column(
        Enum(TaskStatus),
        nullable=False,
        default=TaskStatus.PENDING,
        index=True,
        comment="Task status"
    )
    
    # Relationships
    assigned_to = relationship(
        "User",
        foreign_keys=[assigned_to_id],
        backref="assigned_tasks"
    )
    
    created_by = relationship(
        "User",
        foreign_keys=[created_by_id],
        backref="created_tasks"
    )
    
    def __repr__(self):
        """String representation of the Task model."""
        return f"<Task(id={self.id}, title={self.title}, status={self.status}, priority={self.priority})>"
    
    @property
    def is_overdue(self) -> bool:
        """
        Check if task is overdue.
        
        Returns:
            bool: True if task is overdue
        """
        if self.status == TaskStatus.COMPLETED:
            return False
        
        if self.due_date and self.due_date < date.today():
            return True
        
        return False
