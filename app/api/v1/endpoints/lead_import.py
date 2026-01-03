"""
Lead Import API endpoints.
Handles file upload, column mapping, preview, duplicate detection, and import execution.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.models.import_session import ImportSessionStatus
from app.crud import lead_import as import_crud
from app.services import lead_import_service as import_service
from app.schemas.lead_import import (
    UploadAnalysisResponse,
    MappingSubmission,
    PreviewResponse,
    DuplicatesResponse,
    ExecuteImportRequest,
    ImportSessionResponse,
    ImportResultResponse,
    ValidationError,
    InFileDuplicate
)


router = APIRouter()


@router.post("/upload", response_model=UploadAnalysisResponse)
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload a CSV or Excel file for lead import.
    
    Returns detected columns, suggested mappings, and sample rows.
    """
    # Validate file type
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    filename_lower = file.filename.lower()
    if not (filename_lower.endswith('.csv') or filename_lower.endswith('.xlsx') or filename_lower.endswith('.xls')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV and Excel (.xlsx, .xls) files are supported"
        )
    
    # Read and parse file
    content = await file.read()
    columns, rows = import_service.parse_file(content, file.filename)
    
    if not columns:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No columns detected in file"
        )
    
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data rows found in file"
        )
    
    # Create import session
    session = import_crud.create_import_session(
        db=db,
        user_id=current_user.id,
        file_name=file.filename,
        detected_columns=columns,
        file_data=rows
    )
    
    # Suggest mappings
    suggested_mappings = import_service.suggest_mappings(columns)
    
    # Get sample rows (first 5)
    sample_rows = rows[:5]
    
    return UploadAnalysisResponse(
        session_id=session.id,
        detected_columns=columns,
        suggested_mappings=suggested_mappings,
        sample_rows=sample_rows,
        available_crm_fields=import_service.AVAILABLE_CRM_FIELDS
    )



@router.post("/{session_id}/mapping")
async def submit_mapping(
    session_id: int,
    data: MappingSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Submit column mappings for an import session.
    """
    session = import_crud.get_import_session(db, session_id)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Import session not found"
        )
    
    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this session"
        )
    
    # Validate required mappings
    if "email" not in data.mappings.values():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email field mapping is required"
        )
    
    if "full_name" not in data.mappings.values():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full name field mapping is required"
        )
    
    # Update session with mappings
    import_crud.update_session_mappings(db, session_id, data.mappings)
    
    return {"status": "ok", "message": "Mappings saved successfully"}


@router.get("/{session_id}/preview", response_model=PreviewResponse)
async def get_preview(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a preview of normalized and validated data.
    """
    session = import_crud.get_import_session(db, session_id)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Import session not found"
        )
    
    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this session"
        )
    
    if not session.column_mappings:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Column mappings not yet submitted"
        )
    
    # Normalize data
    file_data = session.file_data or []
    normalized_data = [
        import_service.normalize_row(row, session.column_mappings)
        for row in file_data
    ]
    
    # Validate
    valid_leads, errors, valid_count = import_service.validate_normalized_data(normalized_data)
    
    # Update session
    import_crud.update_session_validation(db, session_id, valid_count)
    
    return PreviewResponse(
        total_rows=len(file_data),
        valid_rows=valid_count,
        invalid_count=len(file_data) - valid_count,
        validation_errors=errors[:20],  # Limit errors returned
        sample_normalized=valid_leads[:10]  # Limit sample size
    )


@router.get("/{session_id}/duplicates", response_model=DuplicatesResponse)
async def get_duplicates(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get duplicate detection results.
    """
    session = import_crud.get_import_session(db, session_id)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Import session not found"
        )
    
    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this session"
        )
    
    if not session.column_mappings:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Column mappings not yet submitted"
        )
    
    # Normalize data
    file_data = session.file_data or []
    normalized_data = [
        import_service.normalize_row(row, session.column_mappings)
        for row in file_data
    ]
    
    # Detect duplicates
    exact_dupes, smart_matches, in_file_dupes = import_service.detect_duplicates(
        db, normalized_data
    )
    
    return DuplicatesResponse(
        total_duplicates=len(exact_dupes) + len(smart_matches),
        existing_duplicates=exact_dupes,
        smart_matches=smart_matches,
        in_file_duplicates=in_file_dupes
    )


@router.post("/{session_id}/execute", response_model=ImportResultResponse)
async def execute_import(
    session_id: int,
    request: ExecuteImportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Execute the final import.
    """
    session = import_crud.get_import_session(db, session_id)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Import session not found"
        )
    
    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this session"
        )
    
    if session.status == ImportSessionStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Import already completed"
        )
    
    if not session.column_mappings:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Column mappings not yet submitted"
        )
    
    # Update status to executing
    import_crud.update_session_status(db, session_id, ImportSessionStatus.EXECUTING)
    
    try:
        # Execute import
        imported, skipped, updated, errors = import_service.execute_import(
            db, session, request.duplicate_decisions, current_user.id
        )
        
        # Update session
        import_crud.update_session_import_count(db, session_id, imported)
        
        return ImportResultResponse(
            session_id=session_id,
            status=ImportSessionStatus.COMPLETED,
            imported_count=imported,
            skipped_count=skipped,
            updated_count=updated,
            error_count=errors
        )
    except Exception as e:
        import_crud.update_session_status(
            db, session_id, ImportSessionStatus.FAILED, str(e)
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Import failed: {str(e)}"
        )


@router.get("/sessions/{session_id}", response_model=ImportSessionResponse)
async def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get import session details.
    """
    session = import_crud.get_import_session(db, session_id)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Import session not found"
        )
    
    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this session"
        )
    
    return session
