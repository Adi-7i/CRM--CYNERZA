"""
Lead model for CRM lead management.
"""
from sqlalchemy import Column, String, Enum, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class LeadSource(str, enum.Enum):
    """
    Lead source enumeration.
    Defines where the lead came from.
    """
    WEBSITE = "Website"
    REFERRAL = "Referral"
    CAMPAIGN = "Campaign"
    DIRECT = "Direct"
    OTHER = "Other"


class LeadStatus(str, enum.Enum):
    """
    Lead status enumeration.
    Defines the current state of the lead in the sales pipeline.
    """
    NEW = "New"
    CONTACTED = "Contacted"
    QUALIFIED = "Qualified"
    PROPOSAL = "Proposal"
    WON = "Won"
    LOST = "Lost"


class Lead(BaseModel):
    """
    Lead model for managing sales leads.
    Inherits id, created_at, and updated_at from BaseModel.
    
    Fields:
        full_name: Lead's full name
        email: Lead's email address
        phone: Lead's phone number (optional)
        source: Where the lead came from
        status: Current status in sales pipeline
        assigned_to_id: User ID of assigned sales person
        created_by_id: User ID who created the lead
        assigned_to: Relationship to User model (assigned sales person)
        created_by: Relationship to User model (creator)
        notes: Relationship to LeadNote model (activity history)
    """
    __tablename__ = "leads"
    
    # Lead information
    full_name = Column(
        String(255),
        nullable=False,
        comment="Lead's full name"
    )
    
    email = Column(
        String(255),
        nullable=False,
        index=True,
        comment="Lead's email address"
    )
    
    phone = Column(
        String(20),
        nullable=True,
        comment="Lead's phone number"
    )
    
    source = Column(
        Enum(LeadSource),
        nullable=False,
        default=LeadSource.OTHER,
        comment="Lead source"
    )
    
    status = Column(
        Enum(LeadStatus),
        nullable=False,
        default=LeadStatus.NEW,
        index=True,
        comment="Current status in sales pipeline"
    )
    
    # Assignment and ownership
    assigned_to_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Assigned sales person ID"
    )
    
    created_by_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        comment="User who created the lead"
    )
    
    # Relationships
    assigned_to = relationship(
        "User",
        foreign_keys=[assigned_to_id],
        backref="assigned_leads"
    )
    
    created_by = relationship(
        "User",
        foreign_keys=[created_by_id],
        backref="created_leads"
    )
    
    notes = relationship(
        "LeadNote",
        back_populates="lead",
        cascade="all, delete-orphan",
        order_by="LeadNote.created_at.desc()"
    )
    
    def __repr__(self):
        """String representation of the Lead model."""
        return f"<Lead(id={self.id}, name={self.full_name}, status={self.status})>"


class LeadNote(BaseModel):
    """
    LeadNote model for tracking lead activity history.
    Stores notes and interactions with leads.
    
    Fields:
        lead_id: Associated lead ID
        user_id: User who created the note
        note_text: Note content
        lead: Relationship to Lead model
        user: Relationship to User model
    """
    __tablename__ = "lead_notes"
    
    lead_id = Column(
        Integer,
        ForeignKey("leads.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Associated lead ID"
    )
    
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        comment="User who created the note"
    )
    
    note_text = Column(
        Text,
        nullable=False,
        comment="Note content"
    )
    
    # Relationships
    lead = relationship(
        "Lead",
        back_populates="notes"
    )
    
    user = relationship(
        "User",
        backref="lead_notes"
    )
    
    def __repr__(self):
        """String representation of the LeadNote model."""
        return f"<LeadNote(id={self.id}, lead_id={self.lead_id})>"
