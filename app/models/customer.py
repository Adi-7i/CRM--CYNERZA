"""
Customer model for CRM customer management.
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class InteractionType(str, enum.Enum):
    """
    Customer interaction type enumeration.
    Defines the type of interaction with a customer.
    """
    CALL = "Call"
    EMAIL = "Email"
    MEETING = "Meeting"
    NOTE = "Note"


class Customer(BaseModel):
    """
    Customer model for managing converted leads/clients.
    Inherits id, created_at, and updated_at from BaseModel.
    
    Fields:
        full_name: Customer's full name
        email: Customer's email address
        phone: Customer's phone number (optional)
        company: Customer's company name (optional)
        lead_id: Original lead ID (if converted from lead)
        assigned_to_id: User ID of assigned account manager
        created_by_id: User ID who created the customer record
        assigned_to: Relationship to User model (assigned account manager)
        created_by: Relationship to User model (creator)
        lead: Relationship to Lead model (original lead)
        interactions: Relationship to CustomerInteraction model (history)
    """
    __tablename__ = "customers"
    
    # Customer information
    full_name = Column(
        String(255),
        nullable=False,
        comment="Customer's full name"
    )
    
    email = Column(
        String(255),
        nullable=False,
        index=True,
        comment="Customer's email address"
    )
    
    phone = Column(
        String(20),
        nullable=True,
        comment="Customer's phone number"
    )
    
    company = Column(
        String(255),
        nullable=True,
        comment="Customer's company name"
    )
    
    # Lead relationship (if converted from lead)
    lead_id = Column(
        Integer,
        ForeignKey("leads.id", ondelete="SET NULL"),
        nullable=True,
        unique=True,  # One lead can only be converted to one customer
        comment="Original lead ID (if converted)"
    )
    
    # Assignment and ownership
    assigned_to_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Assigned account manager ID"
    )
    
    created_by_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        comment="User who created the customer record"
    )
    
    # Relationships
    assigned_to = relationship(
        "User",
        foreign_keys=[assigned_to_id],
        backref="assigned_customers"
    )
    
    created_by = relationship(
        "User",
        foreign_keys=[created_by_id],
        backref="created_customers"
    )
    
    lead = relationship(
        "Lead",
        foreign_keys=[lead_id],
        backref="converted_customer"
    )
    
    interactions = relationship(
        "CustomerInteraction",
        back_populates="customer",
        cascade="all, delete-orphan",
        order_by="CustomerInteraction.created_at.desc()"
    )
    
    def __repr__(self):
        """String representation of the Customer model."""
        return f"<Customer(id={self.id}, name={self.full_name}, company={self.company})>"


class CustomerInteraction(BaseModel):
    """
    CustomerInteraction model for tracking customer communication history.
    Stores calls, emails, meetings, and notes.
    
    Fields:
        customer_id: Associated customer ID
        user_id: User who logged the interaction
        interaction_type: Type of interaction (Call, Email, Meeting, Note)
        subject: Interaction subject/title (optional)
        description: Interaction details
        customer: Relationship to Customer model
        user: Relationship to User model
    """
    __tablename__ = "customer_interactions"
    
    customer_id = Column(
        Integer,
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Associated customer ID"
    )
    
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        comment="User who logged the interaction"
    )
    
    interaction_type = Column(
        Enum(InteractionType),
        nullable=False,
        comment="Type of interaction"
    )
    
    subject = Column(
        String(255),
        nullable=True,
        comment="Interaction subject/title"
    )
    
    description = Column(
        Text,
        nullable=False,
        comment="Interaction details"
    )
    
    # Relationships
    customer = relationship(
        "Customer",
        back_populates="interactions"
    )
    
    user = relationship(
        "User",
        backref="customer_interactions"
    )
    
    def __repr__(self):
        """String representation of the CustomerInteraction model."""
        return f"<CustomerInteraction(id={self.id}, customer_id={self.customer_id}, type={self.interaction_type})>"
