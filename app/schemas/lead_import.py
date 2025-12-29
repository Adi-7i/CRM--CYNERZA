"""
Pydantic schemas for Smart Lead Import System.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from enum import Enum


class DuplicateAction(str, Enum):
    """Action to take for duplicate leads."""
    SKIP = "skip"
    UPDATE = "update"
    INSERT = "insert"


# ========== Phase 1: Upload & Analyze ==========

class UploadAnalysisResponse(BaseModel):
    """Response from file upload and analysis."""
    session_id: int = Field(..., description="Import session ID")
    file_name: str = Field(..., description="Original filename")
    total_rows: int = Field(..., description="Total data rows in file")
    detected_columns: List[str] = Field(..., description="Detected column headers")
    removed_columns: List[str] = Field(default=[], description="Columns removed during cleaning")
    suggested_mappings: Dict[str, str] = Field(..., description="Auto-detected mappings")
    sample_rows: List[Dict[str, Any]] = Field(..., description="5 sample rows for preview")
    available_crm_fields: List[str] = Field(..., description="Available CRM fields for mapping")
    available_templates: List[Dict[str, Any]] = Field(default=[], description="Matching saved templates")
    
    model_config = {"from_attributes": True}


# ========== Phase 2: Mapping ==========

class MergeRule(BaseModel):
    """Rule for merging columns."""
    target: str = Field(..., description="Target CRM field")
    sources: List[str] = Field(..., description="Source columns to merge")
    separator: str = Field(default=" ", description="Separator between values")


class MappingSubmission(BaseModel):
    """User-submitted column mappings."""
    mappings: Dict[str, str] = Field(..., description="Column name to CRM field mappings")
    merge_rules: List[MergeRule] = Field(default=[], description="Rules for merging columns")
    ignored_columns: List[str] = Field(default=[], description="Columns to ignore")
    save_as_template: bool = Field(default=False, description="Save as reusable template")
    template_name: Optional[str] = Field(None, description="Name for saved template")


class MappingResponse(BaseModel):
    """Response after mapping submission."""
    session_id: int
    status: str
    mapped_fields: List[str]
    
    model_config = {"from_attributes": True}


# ========== Phase 3: Normalized Preview ==========

class ValidationError(BaseModel):
    """Single validation error."""
    row: int = Field(..., description="Row number")
    field: str = Field(..., description="Field with error")
    error: str = Field(..., description="Error message")
    value: Optional[str] = Field(None, description="Invalid value")


class NormalizedPreviewResponse(BaseModel):
    """Response with normalized data preview."""
    session_id: int
    status: str
    total_rows: int
    valid_rows: int
    invalid_count: int
    validation_errors: List[Dict[str, Any]] = Field(default=[], description="Rows with errors")
    sample_normalized: List[Dict[str, Any]] = Field(default=[], description="Sample normalized rows")
    
    model_config = {"from_attributes": True}


# ========== Phase 4: Duplicates ==========

class InFileDuplicate(BaseModel):
    """Duplicate found within the import file."""
    rows: List[int] = Field(..., description="Row numbers that are duplicates")
    match_type: str = Field(..., description="Type of match: email, phone")
    match_value: str = Field(..., description="Value that matched")
    reason: str = Field(..., description="Human-readable reason")


class ExistingDuplicate(BaseModel):
    """Match against existing CRM lead."""
    import_row: int = Field(..., description="Row number in import file")
    import_data: Dict[str, Any] = Field(..., description="Import row data")
    existing_lead_id: int = Field(..., description="ID of existing lead")
    existing_lead: Dict[str, Any] = Field(..., description="Existing lead data")
    match_type: str = Field(..., description="Type of match: email, phone, smart")
    match_value: Optional[str] = Field(None, description="Value that matched")


class SmartMatch(BaseModel):
    """Fuzzy/smart match."""
    import_row: int
    import_data: Dict[str, Any]
    existing_lead_id: int
    existing_lead: Dict[str, Any]
    match_type: str = "smart"
    similarity: float
    reason: str


class DuplicatesResponse(BaseModel):
    """Response with all duplicate detection results."""
    session_id: int
    status: str
    in_file_duplicates: List[Dict[str, Any]] = Field(default=[])
    existing_duplicates: List[Dict[str, Any]] = Field(default=[])
    smart_matches: List[Dict[str, Any]] = Field(default=[])
    total_duplicates: int
    
    model_config = {"from_attributes": True}


# ========== Phase 5: Execute Import ==========

class ExecuteImportRequest(BaseModel):
    """Request to execute final import."""
    duplicate_decisions: Dict[str, DuplicateAction] = Field(
        ..., 
        description="Row number -> action for each duplicate"
    )


class ImportSummary(BaseModel):
    """Summary of import results."""
    total_rows: int
    inserted: int
    updated: int
    skipped: int
    errors: int


class ExecuteImportResponse(BaseModel):
    """Response after import execution."""
    session_id: int
    status: str
    summary: ImportSummary
    inserted_lead_ids: List[int] = Field(default=[])
    updated_lead_ids: List[int] = Field(default=[])
    
    model_config = {"from_attributes": True}


# ========== Templates ==========

class TemplateCreate(BaseModel):
    """Request to create a mapping template."""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    mappings: Dict[str, str]
    merge_rules: List[MergeRule] = Field(default=[])
    ignored_columns: List[str] = Field(default=[])
    is_default: bool = False


class TemplateUpdate(BaseModel):
    """Request to update a mapping template."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    mappings: Optional[Dict[str, str]] = None
    merge_rules: Optional[List[MergeRule]] = None
    ignored_columns: Optional[List[str]] = None
    is_default: Optional[bool] = None


class TemplateResponse(BaseModel):
    """Response for mapping template."""
    id: int
    name: str
    description: Optional[str]
    mappings: Dict[str, str]
    merge_rules: List[Dict[str, Any]]
    ignored_columns: List[str]
    is_default: bool
    use_count: int
    created_by_id: Optional[int]
    
    model_config = {"from_attributes": True}


# ========== Session Status ==========

class SessionStatusResponse(BaseModel):
    """Current status of import session."""
    session_id: int
    status: str
    file_name: str
    total_rows: int
    valid_rows: int
    error_message: Optional[str]
    created_at: str
    
    model_config = {"from_attributes": True}
