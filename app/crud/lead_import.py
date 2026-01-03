"""
CRUD operations for ImportSession.
"""
from typing import Optional
from sqlalchemy.orm import Session

from app.models.import_session import ImportSession, ImportSessionStatus


def create_import_session(
    db: Session,
    user_id: int,
    file_name: str,
    detected_columns: list,
    file_data: list
) -> ImportSession:
    """Create a new import session."""
    session = ImportSession(
        user_id=user_id,
        file_name=file_name,
        status=ImportSessionStatus.ANALYZING,
        detected_columns=detected_columns,
        file_data=file_data,
        total_rows=len(file_data)
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_import_session(db: Session, session_id: int) -> Optional[ImportSession]:
    """Get an import session by ID."""
    return db.query(ImportSession).filter(ImportSession.id == session_id).first()


def update_session_status(
    db: Session,
    session_id: int,
    status: ImportSessionStatus,
    error_message: Optional[str] = None
) -> Optional[ImportSession]:
    """Update import session status."""
    session = get_import_session(db, session_id)
    if session:
        session.status = status
        if error_message:
            session.error_message = error_message
        db.commit()
        db.refresh(session)
    return session


def update_session_mappings(
    db: Session,
    session_id: int,
    mappings: dict
) -> Optional[ImportSession]:
    """Update column mappings for a session."""
    session = get_import_session(db, session_id)
    if session:
        session.column_mappings = mappings
        session.status = ImportSessionStatus.MAPPING
        db.commit()
        db.refresh(session)
    return session


def update_session_validation(
    db: Session,
    session_id: int,
    valid_rows: int
) -> Optional[ImportSession]:
    """Update validation results."""
    session = get_import_session(db, session_id)
    if session:
        session.valid_rows = valid_rows
        session.status = ImportSessionStatus.PREVIEWING
        db.commit()
        db.refresh(session)
    return session


def update_session_import_count(
    db: Session,
    session_id: int,
    imported_count: int
) -> Optional[ImportSession]:
    """Update imported count and mark as completed."""
    session = get_import_session(db, session_id)
    if session:
        session.imported_count = imported_count
        session.status = ImportSessionStatus.COMPLETED
        db.commit()
        db.refresh(session)
    return session
