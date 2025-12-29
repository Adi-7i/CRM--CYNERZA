"""
MappingTemplate model for storing reusable column mappings.
Templates are saved per-company for consistent imports.
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Boolean, Text
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class MappingTemplate(BaseModel):
    """
    Reusable mapping template for lead imports.
    Saved per company to enable consistent imports across users.
    
    A template stores:
    - Column to CRM field mappings
    - Merge rules (e.g., first_name + last_name -> full_name)
    - Columns to ignore
    """
    __tablename__ = "mapping_templates"
    
    # Template identification
    name = Column(
        String(255),
        nullable=False,
        comment="Template name for display"
    )
    
    description = Column(
        Text,
        nullable=True,
        comment="Optional description of when to use this template"
    )
    
    # Scope - no company_id since we don't have companies table
    # Templates are global but created by specific users
    created_by_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="User who created the template"
    )
    
    is_default = Column(
        Boolean,
        default=False,
        nullable=False,
        comment="If true, auto-apply for matching column sets"
    )
    
    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
        comment="If false, template is archived"
    )
    
    # Mapping configuration
    mappings = Column(
        JSON,
        nullable=False,
        default=dict,
        comment="Column name to CRM field mappings"
    )
    
    merge_rules = Column(
        JSON,
        nullable=True,
        default=list,
        comment="Rules for merging multiple columns"
    )
    
    ignored_columns = Column(
        JSON,
        nullable=True,
        default=list,
        comment="Columns to ignore during import"
    )
    
    # Signature for matching
    column_signature = Column(
        String(512),
        nullable=True,
        index=True,
        comment="Hash of column names for template suggestion"
    )
    
    # Usage tracking
    use_count = Column(
        Integer,
        default=0,
        comment="Number of times this template was used"
    )
    
    # Relationships
    created_by = relationship("User", backref="mapping_templates")
    
    def __repr__(self):
        return f"<MappingTemplate(id={self.id}, name={self.name})>"
