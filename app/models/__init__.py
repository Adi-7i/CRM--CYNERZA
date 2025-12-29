"""
SQLAlchemy models for database tables.
"""
from app.models.base import Base
from app.models.user import User
from app.models.lead import Lead, LeadNote, LeadStatus, LeadSource
from app.models.customer import Customer, CustomerInteraction, InteractionType
from app.models.deal import Deal, DealStage
from app.models.task import Task, TaskPriority, TaskStatus, RelatedEntityType
from app.models.import_session import ImportSession, ImportStatus
from app.models.mapping_template import MappingTemplate

# Export all models for easy importing
__all__ = [
    "Base", "User", 
    "Lead", "LeadNote", "LeadStatus", "LeadSource",
    "Customer", "CustomerInteraction", "InteractionType",
    "Deal", "DealStage",
    "Task", "TaskPriority", "TaskStatus", "RelatedEntityType",
    "ImportSession", "ImportStatus",
    "MappingTemplate"
]
