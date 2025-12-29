"""
Smart Lead Import API endpoints.
Multi-phase import workflow with mapping, normalization, and deduplication.
"""
import io
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import pandas as pd

from app.api.deps import get_db, get_current_active_user
from app.core.permissions import require_admin_or_manager
from app.models.user import User
from app.models.import_session import ImportSession, ImportStatus
from app.models.lead import Lead, LeadStatus
from app.schemas.lead import LeadCreate
from app.schemas.lead_import import (
    UploadAnalysisResponse,
    MappingSubmission,
    MappingResponse,
    NormalizedPreviewResponse,
    DuplicatesResponse,
    ExecuteImportRequest,
    ExecuteImportResponse,
    ImportSummary,
    TemplateCreate,
    TemplateUpdate,
    TemplateResponse,
    SessionStatusResponse
)
from app.services.lead_import.analyzer import AnalyzerService
from app.services.lead_import.normalizer import NormalizerService
from app.services.lead_import.deduplicator import DeduplicatorService
from app.services.lead_import.session_manager import SessionManager
from app.services.lead_import.template_manager import TemplateManager
from app.crud import lead as lead_crud


router = APIRouter()


# ========== Phase 1: Upload & Analyze ==========

@router.post("/upload", response_model=UploadAnalysisResponse)
def upload_and_analyze(
    file: UploadFile = File(..., description="Excel (.xlsx) or CSV (.csv) file"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """
    Phase 1: Upload file and analyze columns.
    
    **Requires**: Admin or Manager role
    
    Returns detected columns, suggested mappings, and sample rows.
    Creates an import session to track the workflow.
    """
    # Analyze file
    analyzer = AnalyzerService()
    analysis = analyzer.analyze(file)
    
    # Find matching templates
    template_mgr = TemplateManager(db)
    matching_templates = template_mgr.find_matching_templates(
        analysis.get("column_signature", "")
    )
    
    # Create import session
    session_mgr = SessionManager(db)
    session = session_mgr.create_session(
        user=current_user,
        file_name=analysis["file_name"],
        file_data=analysis["file_content"],
        analysis_result=analysis
    )
    
    return UploadAnalysisResponse(
        session_id=session.id,
        file_name=analysis["file_name"],
        total_rows=analysis["total_rows"],
        detected_columns=analysis["detected_columns"],
        removed_columns=analysis.get("removed_columns", []),
        suggested_mappings=analysis["suggested_mappings"],
        sample_rows=analysis["sample_rows"],
        available_crm_fields=analysis["available_crm_fields"],
        available_templates=[
            {"id": t.id, "name": t.name, "mappings": t.mappings}
            for t in matching_templates
        ]
    )


# ========== Phase 2: Submit Mapping ==========

@router.post("/{session_id}/mapping", response_model=MappingResponse)
def submit_mapping(
    session_id: int,
    mapping_data: MappingSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """
    Phase 2: Submit column mappings.
    
    **Requires**: Admin or Manager role
    
    Define which columns map to which CRM fields.
    Optionally save as reusable template.
    """
    session_mgr = SessionManager(db)
    session = session_mgr.get_session(session_id, current_user)
    
    if session.status != ImportStatus.MAPPING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Session is in '{session.status.value}' status, expected 'mapping'"
        )
    
    # Convert merge rules to dict format
    merge_rules = [rule.model_dump() for rule in mapping_data.merge_rules]
    
    # Update session with mappings
    session_mgr.update_mapping(
        session=session,
        user_mappings=mapping_data.mappings,
        merge_rules=merge_rules,
        ignored_columns=mapping_data.ignored_columns
    )
    
    # Save template if requested
    if mapping_data.save_as_template and mapping_data.template_name:
        template_mgr = TemplateManager(db)
        template_mgr.create_template(
            user=current_user,
            name=mapping_data.template_name,
            mappings=mapping_data.mappings,
            merge_rules=merge_rules,
            ignored_columns=mapping_data.ignored_columns,
            column_signature=AnalyzerService.generate_column_signature(
                session.detected_columns
            )
        )
    
    # Immediately process normalization
    normalizer = NormalizerService()
    
    # Read file data from session
    file_type = 'csv' if session.file_name.endswith('.csv') else 'xlsx'
    if file_type == 'csv':
        df = pd.read_csv(io.BytesIO(session.file_data))
    else:
        df = pd.read_excel(io.BytesIO(session.file_data))
    
    # Normalize column names
    df.columns = df.columns.str.lower().str.strip()
    data = df.to_dict(orient='records')
    
    # Normalize data
    valid_rows, invalid_rows = normalizer.normalize_data(
        data=data,
        mappings=mapping_data.mappings,
        merge_rules=merge_rules
    )
    
    session_mgr.update_normalized_data(
        session=session,
        valid_rows=valid_rows,
        invalid_rows=invalid_rows
    )
    
    # Run deduplication
    deduplicator = DeduplicatorService()
    duplicate_result = deduplicator.detect_all_duplicates(db, valid_rows)
    
    session_mgr.update_duplicates(session, duplicate_result)
    
    return MappingResponse(
        session_id=session.id,
        status=session.status.value,
        mapped_fields=list(set(mapping_data.mappings.values()))
    )


# ========== Phase 3: Get Normalized Preview ==========

@router.get("/{session_id}/preview", response_model=NormalizedPreviewResponse)
def get_preview(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """
    Phase 3: Get normalized data preview.
    
    **Requires**: Admin or Manager role
    
    Returns validation results and sample normalized data.
    """
    session_mgr = SessionManager(db)
    session = session_mgr.get_session(session_id, current_user)
    
    normalized = session.normalized_data or []
    sample = normalized[:5] if len(normalized) > 5 else normalized
    
    # Convert LeadSource enums to strings for JSON
    for row in sample:
        if "source" in row and hasattr(row["source"], "value"):
            row["source"] = row["source"].value
    
    return NormalizedPreviewResponse(
        session_id=session.id,
        status=session.status.value,
        total_rows=session.total_rows,
        valid_rows=session.valid_rows,
        invalid_count=len(session.validation_errors or []),
        validation_errors=session.validation_errors or [],
        sample_normalized=sample
    )


# ========== Phase 4: Get Duplicates ==========

@router.get("/{session_id}/duplicates", response_model=DuplicatesResponse)
def get_duplicates(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """
    Phase 4: Get duplicate detection results.
    
    **Requires**: Admin or Manager role
    
    Returns all detected duplicates for user decision.
    """
    session_mgr = SessionManager(db)
    session = session_mgr.get_session(session_id, current_user)
    
    return DuplicatesResponse(
        session_id=session.id,
        status=session.status.value,
        in_file_duplicates=session.in_file_duplicates or [],
        existing_duplicates=session.existing_duplicates or [],
        smart_matches=session.smart_matches or [],
        total_duplicates=(
            len(session.in_file_duplicates or []) +
            len(session.existing_duplicates or []) +
            len(session.smart_matches or [])
        )
    )


# ========== Phase 5: Execute Import ==========

@router.post("/{session_id}/execute", response_model=ExecuteImportResponse)
def execute_import(
    session_id: int,
    request: ExecuteImportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """
    Phase 5: Execute final import.
    
    **Requires**: Admin or Manager role
    
    Apply duplicate decisions and import leads.
    """
    session_mgr = SessionManager(db)
    session = session_mgr.get_session(session_id, current_user)
    
    if session.status != ImportStatus.READY:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Session is in '{session.status.value}' status, expected 'ready'"
        )
    
    # Store decisions
    decisions = {k: v.value for k, v in request.duplicate_decisions.items()}
    session_mgr.update_duplicate_decisions(session, decisions)
    
    # Build set of rows to skip
    skip_rows = set()
    update_rows = {}  # row_num -> existing_lead_id
    
    # Process in-file duplicates (keep first, skip rest)
    for dup in (session.in_file_duplicates or []):
        rows = dup.get("rows", [])
        if len(rows) > 1:
            skip_rows.update(rows[1:])  # Skip all but first
    
    # Process existing duplicates based on decisions
    for dup in (session.existing_duplicates or []):
        row_num = str(dup.get("import_row", 0))
        action = decisions.get(row_num, "skip")
        
        if action == "skip":
            skip_rows.add(dup["import_row"])
        elif action == "update":
            update_rows[dup["import_row"]] = dup["existing_lead_id"]
    
    # Process smart matches
    for match in (session.smart_matches or []):
        row_num = str(match.get("import_row", 0))
        action = decisions.get(row_num, "skip")
        
        if action == "skip":
            skip_rows.add(match["import_row"])
        elif action == "update":
            update_rows[match["import_row"]] = match["existing_lead_id"]
    
    # Import leads
    inserted_ids = []
    updated_ids = []
    errors = 0
    
    for row in (session.normalized_data or []):
        row_num = row.get("_row_num", 0)
        
        if row_num in skip_rows:
            continue
        
        try:
            if row_num in update_rows:
                # Update existing lead
                lead_id = update_rows[row_num]
                lead = db.query(Lead).filter(Lead.id == lead_id).first()
                if lead:
                    lead.full_name = row.get("full_name", lead.full_name)
                    lead.email = row.get("email", lead.email)
                    lead.phone = row.get("phone", lead.phone)
                    db.commit()
                    updated_ids.append(lead_id)
            else:
                # Create new lead
                source = row.get("source")
                if hasattr(source, "value"):
                    source_value = source
                else:
                    from app.models.lead import LeadSource
                    source_value = LeadSource.OTHER
                
                lead_data = LeadCreate(
                    full_name=row["full_name"],
                    email=row["email"],
                    phone=row.get("phone"),
                    source=source_value,
                    status=LeadStatus.NEW
                )
                
                lead = lead_crud.create_lead(
                    db=db,
                    lead=lead_data,
                    created_by_id=current_user.id
                )
                inserted_ids.append(lead.id)
                
        except Exception as e:
            errors += 1
    
    # Complete session
    result = {
        "total_rows": session.total_rows,
        "inserted": len(inserted_ids),
        "updated": len(updated_ids),
        "skipped": len(skip_rows),
        "errors": errors
    }
    
    session_mgr.complete_session(
        session=session,
        result=result,
        inserted_ids=inserted_ids,
        updated_ids=updated_ids
    )
    
    return ExecuteImportResponse(
        session_id=session.id,
        status=session.status.value,
        summary=ImportSummary(**result),
        inserted_lead_ids=inserted_ids,
        updated_lead_ids=updated_ids
    )


# ========== Session Status ==========

@router.get("/{session_id}/status", response_model=SessionStatusResponse)
def get_session_status(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """
    Get current status of import session.
    """
    session_mgr = SessionManager(db)
    session = session_mgr.get_session(session_id, current_user)
    
    return SessionStatusResponse(
        session_id=session.id,
        status=session.status.value,
        file_name=session.file_name,
        total_rows=session.total_rows,
        valid_rows=session.valid_rows,
        error_message=session.error_message,
        created_at=session.created_at.isoformat()
    )


@router.delete("/{session_id}")
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """
    Delete an import session.
    """
    session_mgr = SessionManager(db)
    session = session_mgr.get_session(session_id, current_user)
    session_mgr.delete_session(session)
    
    return {"message": "Session deleted"}


# ========== Templates ==========

@router.get("/templates", response_model=List[TemplateResponse])
def list_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """List all available mapping templates."""
    template_mgr = TemplateManager(db)
    templates = template_mgr.get_all_templates()
    return templates


@router.post("/templates", response_model=TemplateResponse)
def create_template(
    template_data: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """Create a new mapping template."""
    template_mgr = TemplateManager(db)
    
    merge_rules = [rule.model_dump() for rule in template_data.merge_rules]
    
    template = template_mgr.create_template(
        user=current_user,
        name=template_data.name,
        description=template_data.description,
        mappings=template_data.mappings,
        merge_rules=merge_rules,
        ignored_columns=template_data.ignored_columns,
        is_default=template_data.is_default
    )
    
    return template


@router.get("/templates/{template_id}", response_model=TemplateResponse)
def get_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """Get a specific template."""
    template_mgr = TemplateManager(db)
    return template_mgr.get_template(template_id)


@router.put("/templates/{template_id}", response_model=TemplateResponse)
def update_template(
    template_id: int,
    template_data: TemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """Update a template."""
    template_mgr = TemplateManager(db)
    
    merge_rules = None
    if template_data.merge_rules is not None:
        merge_rules = [rule.model_dump() for rule in template_data.merge_rules]
    
    return template_mgr.update_template(
        template_id=template_id,
        name=template_data.name,
        description=template_data.description,
        mappings=template_data.mappings,
        merge_rules=merge_rules,
        ignored_columns=template_data.ignored_columns,
        is_default=template_data.is_default
    )


@router.delete("/templates/{template_id}")
def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """Delete (archive) a template."""
    template_mgr = TemplateManager(db)
    template_mgr.delete_template(template_id)
    return {"message": "Template deleted"}
