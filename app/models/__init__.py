"""
SQLAlchemy models for database tables.
"""
from app.models.base import Base
from app.models.user import User
from app.models.lead import Lead, LeadNote, LeadStatus, LeadSource
from app.models.customer import Customer, CustomerInteraction, InteractionType
from app.models.deal import Deal, DealStage
from app.models.task import Task, TaskPriority, TaskStatus, RelatedEntityType

# Export all models for easy importing
__all__ = [
    "Base", "User", 
    "Lead", "LeadNote", "LeadStatus", "LeadSource",
    "Customer", "CustomerInteraction", "InteractionType",
    "Deal", "DealStage",
    "Task", "TaskPriority", "TaskStatus", "RelatedEntityType"
]
