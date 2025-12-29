"""
ImportSession model for tracking lead import operations.
Stores the state and data for each phase of the import workflow.
"""
import enum
from sqlalchemy import Column, String, Integer, ForeignKey, Enum, Text, LargeBinary
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class ImportStatus(str, enum.Enum):
    """Status of the import session."""
    ANALYZING = "analyzing"
    MAPPING = "mapping"
    NORMALIZING = "normalizing"
    DEDUPLICATING = "deduplicating"
    READY = "ready"
    COMPLETED = "completed"
    FAILED = "failed"


class ImportSession(BaseModel):
    """
    Tracks the state of a lead import operation.
    Each import goes through multiple phases before completion.
    
    Workflow:
    1. ANALYZING: File uploaded, detecting columns
    2. MAPPING: Waiting for user to map columns
    3. NORMALIZING: Cleaning and validating data
    4. DEDUPLICATING: Finding duplicates
    5. READY: Waiting for user to resolve duplicates
    6. COMPLETED: Import finished successfully
    7. FAILED: Import failed with error
    """
    __tablename__ = "import_sessions"
    
    # Session identification
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="User who initiated the import"
    )
    
    # Status tracking
    status = Column(
        Enum(ImportStatus),
        default=ImportStatus.ANALYZING,
        nullable=False,
        index=True,
        comment="Current status of the import session"
    )
    
    error_message = Column(
        Text,
        nullable=True,
        comment="Error message if status is FAILED"
    )
    
    # File information
    file_name = Column(
        String(255),
        nullable=False,
        comment="Original filename"
    )
    
    file_data = Column(
        LargeBinary,
        nullable=True,
        comment="Stored file content for reprocessing"
    )
    
    # Phase 1: Analysis results
    detected_columns = Column(
        JSON,
        nullable=True,
        default=list,
        comment="List of detected column headers from file"
    )
    
    suggested_mappings = Column(
        JSON,
        nullable=True,
        default=dict,
        comment="Auto-detected column to field mappings"
    )
    
    sample_rows = Column(
        JSON,
        nullable=True,
        default=list,
        comment="5 sample rows for preview"
    )
    
    # Phase 2: User mappings
    user_mappings = Column(
        JSON,
        nullable=True,
        default=dict,
        comment="User-confirmed column to field mappings"
    )
    
    merge_rules = Column(
        JSON,
        nullable=True,
        default=list,
        comment="Rules for merging columns (e.g., first+last name)"
    )
    
    ignored_columns = Column(
        JSON,
        nullable=True,
        default=list,
        comment="Columns marked to ignore"
    )
    
    # Phase 3: Normalized data
    total_rows = Column(
        Integer,
        default=0,
        comment="Total rows in file"
    )
    
    valid_rows = Column(
        Integer,
        default=0,
        comment="Rows that passed validation"
    )
    
    normalized_data = Column(
        JSON,
        nullable=True,
        default=list,
        comment="Cleaned data after normalization"
    )
    
    validation_errors = Column(
        JSON,
        nullable=True,
        default=list,
        comment="Rows that failed validation with reasons"
    )
    
    # Phase 4: Duplicate detection
    in_file_duplicates = Column(
        JSON,
        nullable=True,
        default=list,
        comment="Duplicates found within the file"
    )
    
    existing_duplicates = Column(
        JSON,
        nullable=True,
        default=list,
        comment="Matches with existing CRM leads"
    )
    
    smart_matches = Column(
        JSON,
        nullable=True,
        default=list,
        comment="Fuzzy matches (same company + similar name)"
    )
    
    # Phase 5: Import results
    duplicate_decisions = Column(
        JSON,
        nullable=True,
        default=dict,
        comment="User decisions for each duplicate: skip/update/insert"
    )
    
    import_result = Column(
        JSON,
        nullable=True,
        default=dict,
        comment="Final import summary with counts"
    )
    
    inserted_lead_ids = Column(
        JSON,
        nullable=True,
        default=list,
        comment="IDs of newly created leads"
    )
    
    updated_lead_ids = Column(
        JSON,
        nullable=True,
        default=list,
        comment="IDs of updated leads"
    )
    
    # Relationships
    user = relationship("User", backref="import_sessions")
    
    def __repr__(self):
        return f"<ImportSession(id={self.id}, status={self.status}, file={self.file_name})>"
