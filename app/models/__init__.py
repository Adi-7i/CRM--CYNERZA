"""
SQLAlchemy models for database tables.
"""
from app.models.base import Base
from app.models.user import User
from app.models.lead import Lead, LeadNote, LeadStatus, LeadSource
from app.models.customer import Customer, CustomerInteraction, InteractionType

# Export all models for easy importing
__all__ = [
    "Base", "User", 
    "Lead", "LeadNote", "LeadStatus", "LeadSource",
    "Customer", "CustomerInteraction", "InteractionType"
]
