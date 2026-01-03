"""
Pydantic schemas for Lead Import operations.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

from app.models.import_session import ImportSessionStatus


# ========== Upload & Analysis ==========

class UploadAnalysisResponse(BaseModel):
    """Response after file upload and initial analysis."""
    session_id: int
    detected_columns: List[str]
    suggested_mappings: Dict[str, str]
    sample_rows: List[Dict[str, Any]]
    available_crm_fields: List[str]


# ========== Mapping ==========

class MergeRule(BaseModel):
    """Rule for merging multiple columns into one field."""
    source_columns: List[str]
    target_field: str
    separator: str = " "


class MappingSubmission(BaseModel):
    """Submission of column mappings."""
    mappings: Dict[str, str]
    merge_rules: List[MergeRule] = []
    ignored_columns: List[str] = []
    save_as_template: bool = False
    template_name: Optional[str] = None


# ========== Preview & Validation ==========

class ValidationError(BaseModel):
    """Validation error for a specific row/field."""
    row: int
    field: str
    error: str


class NormalizedLead(BaseModel):
    """Preview of a normalized lead record."""
    full_name: str
    email: str
    phone: Optional[str] = None
    source: Optional[str] = None


class PreviewResponse(BaseModel):
    """Response with preview of normalized data."""
    total_rows: int
    valid_rows: int
    invalid_count: int
    validation_errors: List[ValidationError]
    sample_normalized: List[NormalizedLead]


# ========== Duplicates ==========

class ExistingLeadInfo(BaseModel):
    """Info about an existing lead for duplicate matching."""
    id: int
    full_name: str
    email: str


class ImportDataInfo(BaseModel):
    """Info about import data for duplicate matching."""
    full_name: str
    email: str


class DuplicateMatch(BaseModel):
    """A detected duplicate match."""
    import_row: int
    existing_lead: ExistingLeadInfo
    import_data: ImportDataInfo


class SmartMatch(DuplicateMatch):
    """A smart/fuzzy duplicate match with similarity score."""
    similarity_score: float


class InFileDuplicate(BaseModel):
    """Duplicate rows within the import file."""
    rows: List[int]


class DuplicatesResponse(BaseModel):
    """Response with duplicate detection results."""
    total_duplicates: int
    existing_duplicates: List[DuplicateMatch]
    smart_matches: List[SmartMatch]
    in_file_duplicates: List[InFileDuplicate]


# ========== Execution ==========

class ExecuteImportRequest(BaseModel):
    """Request to execute the final import."""
    duplicate_decisions: Dict[str, str] = Field(
        default_factory=dict,
        description="Map of row index to action: skip, update, create"
    )


# ========== Session ==========

class ImportSessionResponse(BaseModel):
    """Response with import session details."""
    id: int
    status: ImportSessionStatus
    total_rows: Optional[int] = None
    valid_rows: Optional[int] = None
    imported_count: Optional[int] = None
    error_message: Optional[str] = None
    created_at: datetime
    
    model_config = {
        "from_attributes": True
    }


class ImportResultResponse(BaseModel):
    """Response after import execution."""
    session_id: int
    status: ImportSessionStatus
    imported_count: int
    skipped_count: int
    updated_count: int
    error_count: int
