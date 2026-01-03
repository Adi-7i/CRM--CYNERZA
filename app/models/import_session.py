"""
ImportSession model for tracking lead import operations.
"""
from sqlalchemy import Column, String, Enum, Integer, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class ImportSessionStatus(str, enum.Enum):
    """Status of an import session."""
    PENDING = "pending"
    ANALYZING = "analyzing"
    MAPPING = "mapping"
    PREVIEWING = "previewing"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"


class ImportSession(BaseModel):
    """
    ImportSession model for tracking bulk lead imports.
    
    Fields:
        status: Current status of the import session
        file_name: Original uploaded file name
        total_rows: Total number of rows in the file
        valid_rows: Number of valid rows after validation
        imported_count: Number of successfully imported leads
        error_message: Error message if failed
        detected_columns: JSON list of detected column names
        column_mappings: JSON mapping of file columns to CRM fields
        file_data: JSON storage of parsed file data
        user_id: User who initiated the import
    """
    __tablename__ = "import_sessions"
    
    status = Column(
        Enum(ImportSessionStatus),
        nullable=False,
        default=ImportSessionStatus.PENDING,
        comment="Current import status"
    )
    
    file_name = Column(
        String(255),
        nullable=True,
        comment="Original file name"
    )
    
    total_rows = Column(
        Integer,
        nullable=True,
        default=0,
        comment="Total rows in file"
    )
    
    valid_rows = Column(
        Integer,
        nullable=True,
        default=0,
        comment="Valid rows after validation"
    )
    
    imported_count = Column(
        Integer,
        nullable=True,
        default=0,
        comment="Successfully imported leads"
    )
    
    error_message = Column(
        Text,
        nullable=True,
        comment="Error message if failed"
    )
    
    detected_columns = Column(
        JSON,
        nullable=True,
        comment="Detected column names from file"
    )
    
    column_mappings = Column(
        JSON,
        nullable=True,
        comment="Column to CRM field mappings"
    )
    
    file_data = Column(
        JSON,
        nullable=True,
        comment="Parsed file data as JSON"
    )
    
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="User who initiated import"
    )
    
    # Relationships
    user = relationship("User", backref="import_sessions")
    
    def __repr__(self):
        return f"<ImportSession(id={self.id}, status={self.status})>"
