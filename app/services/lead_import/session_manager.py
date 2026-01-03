"""
Session Manager for tracking import workflow state.
Handles ImportSession CRUD and state transitions.
"""
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.import_session import ImportSession, ImportStatus
from app.models.user import User


class SessionManager:
    """Manages ImportSession lifecycle and state transitions."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_session(
        self,
        user: User,
        file_name: str,
        file_data: bytes,
        analysis_result: Dict[str, Any]
    ) -> ImportSession:
        """
        Create a new import session after file analysis.
        
        Args:
            user: User who initiated import
            file_name: Original filename
            file_data: Raw file content
            analysis_result: Output from AnalyzerService
            
        Returns:
            Created ImportSession
        """
        session = ImportSession(
            user_id=user.id,
            status=ImportStatus.MAPPING,
            file_name=file_name,
            file_data=file_data,
            detected_columns=analysis_result.get("detected_columns", []),
            suggested_mappings=analysis_result.get("suggested_mappings", {}),
            sample_rows=analysis_result.get("sample_rows", []),
            total_rows=analysis_result.get("total_rows", 0)
        )
        
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        
        return session
    
    def get_session(self, session_id: int, user: User) -> ImportSession:
        """
        Get import session by ID with access check.
        
        Args:
            session_id: Session ID
            user: Current user (must match session owner)
            
        Returns:
            ImportSession
            
        Raises:
            HTTPException if not found or access denied
        """
        session = self.db.query(ImportSession).filter(
            ImportSession.id == session_id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Import session not found"
            )
        
        # Admin can access any session, others only their own
        if user.role.value != "admin" and session.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this import session"
            )
        
        return session
    
    def update_mapping(
        self,
        session: ImportSession,
        user_mappings: Dict[str, str],
        merge_rules: List[Dict] = None,
        ignored_columns: List[str] = None
    ) -> ImportSession:
        """
        Update session with user mappings and transition to normalizing.
        
        Args:
            session: Import session
            user_mappings: Column to field mappings
            merge_rules: Optional merge rules
            ignored_columns: Columns to skip
            
        Returns:
            Updated ImportSession
        """
        session.user_mappings = user_mappings
        session.merge_rules = merge_rules or []
        session.ignored_columns = ignored_columns or []
        session.status = ImportStatus.NORMALIZING
        
        self.db.commit()
        self.db.refresh(session)
        
        return session
    
    def update_normalized_data(
        self,
        session: ImportSession,
        valid_rows: List[Dict],
        invalid_rows: List[Dict]
    ) -> ImportSession:
        """
        Update session with normalized data.
        
        Args:
            session: Import session
            valid_rows: Rows that passed validation
            invalid_rows: Rows with errors
            
        Returns:
            Updated ImportSession
        """
        session.normalized_data = valid_rows
        session.valid_rows = len(valid_rows)
        session.validation_errors = invalid_rows
        session.status = ImportStatus.DEDUPLICATING
        
        self.db.commit()
        self.db.refresh(session)
        
        return session
    
    def update_duplicates(
        self,
        session: ImportSession,
        duplicate_result: Dict[str, Any]
    ) -> ImportSession:
        """
        Update session with duplicate detection results.
        
        Args:
            session: Import session
            duplicate_result: Output from DeduplicatorService
            
        Returns:
            Updated ImportSession
        """
        session.in_file_duplicates = duplicate_result.get("in_file_duplicates", [])
        session.existing_duplicates = duplicate_result.get("existing_duplicates", [])
        session.smart_matches = duplicate_result.get("smart_matches", [])
        session.status = ImportStatus.READY
        
        self.db.commit()
        self.db.refresh(session)
        
        return session
    
    def update_duplicate_decisions(
        self,
        session: ImportSession,
        decisions: Dict[str, str]
    ) -> ImportSession:
        """
        Store user decisions for duplicate handling.
        
        Args:
            session: Import session
            decisions: Row number -> action (skip/update/insert)
            
        Returns:
            Updated ImportSession
        """
        session.duplicate_decisions = decisions
        
        self.db.commit()
        self.db.refresh(session)
        
        return session
    
    def complete_session(
        self,
        session: ImportSession,
        result: Dict[str, Any],
        inserted_ids: List[int],
        updated_ids: List[int]
    ) -> ImportSession:
        """
        Mark session as completed with import results.
        
        Args:
            session: Import session
            result: Import summary
            inserted_ids: IDs of new leads
            updated_ids: IDs of updated leads
            
        Returns:
            Updated ImportSession
        """
        session.status = ImportStatus.COMPLETED
        session.import_result = result
        session.inserted_lead_ids = inserted_ids
        session.updated_lead_ids = updated_ids
        
        self.db.commit()
        self.db.refresh(session)
        
        return session
    
    def fail_session(
        self,
        session: ImportSession,
        error_message: str
    ) -> ImportSession:
        """
        Mark session as failed with error.
        
        Args:
            session: Import session
            error_message: Error description
            
        Returns:
            Updated ImportSession
        """
        session.status = ImportStatus.FAILED
        session.error_message = error_message
        
        self.db.commit()
        self.db.refresh(session)
        
        return session
    
    def get_user_sessions(
        self,
        user: User,
        status_filter: Optional[ImportStatus] = None,
        limit: int = 20
    ) -> List[ImportSession]:
        """
        Get recent import sessions for a user.
        
        Args:
            user: Current user
            status_filter: Optional status filter
            limit: Max sessions to return
            
        Returns:
            List of ImportSessions
        """
        query = self.db.query(ImportSession).filter(
            ImportSession.user_id == user.id
        )
        
        if status_filter:
            query = query.filter(ImportSession.status == status_filter)
        
        return query.order_by(ImportSession.created_at.desc()).limit(limit).all()
    
    def delete_session(self, session: ImportSession) -> None:
        """Delete an import session."""
        self.db.delete(session)
        self.db.commit()
