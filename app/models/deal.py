"""
Deal/Opportunity model for CRM sales pipeline management.
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Numeric, Date, Enum
from sqlalchemy.orm import relationship
import enum
from decimal import Decimal

from app.models.base import BaseModel


class DealStage(str, enum.Enum):
    """
    Deal stage enumeration.
    Represents the current stage of a deal in the sales pipeline.
    """
    PROSPECTING = "Prospecting"
    QUALIFICATION = "Qualification"
    PROPOSAL = "Proposal"
    NEGOTIATION = "Negotiation"
    CLOSED_WON = "Closed_Won"
    CLOSED_LOST = "Closed_Lost"


class Deal(BaseModel):
    """
    Deal/Opportunity model for managing sales opportunities.
    Inherits id, created_at, and updated_at from BaseModel.
    
    Fields:
        title: Deal title/name
        customer_id: Associated customer ID
        owner_id: Sales user who owns this deal
        stage: Current stage in sales pipeline
        value: Deal value in currency
        expected_close_date: Expected closing date
        probability: Win probability (0-100)
        customer: Relationship to Customer model
        owner: Relationship to User model (deal owner)
    """
    __tablename__ = "deals"
    
    # Deal information
    title = Column(
        String(255),
        nullable=False,
        comment="Deal title/name"
    )
    
    # Relationships
    customer_id = Column(
        Integer,
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Associated customer ID"
    )
    
    owner_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Deal owner (sales user) ID"
    )
    
    # Deal details
    stage = Column(
        Enum(DealStage),
        nullable=False,
        default=DealStage.PROSPECTING,
        index=True,
        comment="Current stage in sales pipeline"
    )
    
    value = Column(
        Numeric(15, 2),  # Allows up to 999,999,999,999.99
        nullable=False,
        comment="Deal value in currency"
    )
    
    expected_close_date = Column(
        Date,
        nullable=True,
        comment="Expected closing date"
    )
    
    probability = Column(
        Integer,
        nullable=False,
        default=50,
        comment="Win probability (0-100)"
    )
    
    # Relationships
    customer = relationship(
        "Customer",
        backref="deals"
    )
    
    owner = relationship(
        "User",
        backref="owned_deals"
    )
    
    def __repr__(self):
        """String representation of the Deal model."""
        return f"<Deal(id={self.id}, title={self.title}, stage={self.stage}, value={self.value})>"
    
    @property
    def weighted_value(self) -> Decimal:
        """
        Calculate weighted value based on probability.
        
        Returns:
            Decimal: value * (probability / 100)
        """
        return Decimal(self.value) * (Decimal(self.probability) / Decimal(100))
