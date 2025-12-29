"""
Service for importing leads from Excel/CSV files.
"""
import io
from typing import List, Dict, Any, Tuple
import pandas as pd
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile

from app.models.lead import Lead, LeadStatus, LeadSource
from app.models.user import User, UserRole
from app.crud import lead as lead_crud
from app.schemas.lead import LeadCreate


# Required columns for import
REQUIRED_COLUMNS = ['full_name', 'email']
OPTIONAL_COLUMNS = ['phone', 'source']

# Valid source values
VALID_SOURCES = {s.value for s in LeadSource}


class ImportResult:
    """Result of a lead import operation."""
    
    def __init__(self):
        self.total_rows = 0
        self.inserted = 0
        self.skipped_duplicates = 0
        self.errors: List[Dict[str, Any]] = []
        self.inserted_leads: List[int] = []
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_rows": self.total_rows,
            "inserted": self.inserted,
            "skipped_duplicates": self.skipped_duplicates,
            "error_count": len(self.errors),
            "errors": self.errors[:50],  # Limit errors in response
            "inserted_lead_ids": self.inserted_leads
        }


def validate_file_type(filename: str) -> str:
    """
    Validate file extension and return file type.
    
    Args:
        filename: Name of the uploaded file
        
    Returns:
        File type: 'csv' or 'xlsx'
        
    Raises:
        HTTPException: If file type is not supported
    """
    if filename.endswith('.csv'):
        return 'csv'
    elif filename.endswith('.xlsx') or filename.endswith('.xls'):
        return 'xlsx'
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Please upload .csv or .xlsx file."
        )


def validate_columns(df: pd.DataFrame) -> List[str]:
    """
    Validate that required columns exist.
    
    Args:
        df: Pandas DataFrame
        
    Returns:
        List of missing required columns
    """
    df.columns = df.columns.str.lower().str.strip()
    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    return missing


def normalize_source(source: str) -> LeadSource:
    """
    Normalize source value to match enum.
    
    Args:
        source: Raw source value
        
    Returns:
        LeadSource enum value
    """
    if not source or pd.isna(source):
        return LeadSource.OTHER
    
    source_lower = str(source).lower().strip()
    
    # Map common variations to enum values
    source_map = {
        'website': LeadSource.WEBSITE,
        'web': LeadSource.WEBSITE,
        'referral': LeadSource.REFERRAL,
        'ref': LeadSource.REFERRAL,
        'campaign': LeadSource.CAMPAIGN,
        'marketing': LeadSource.CAMPAIGN,
        'direct': LeadSource.DIRECT,
        'other': LeadSource.OTHER
    }
    
    return source_map.get(source_lower, LeadSource.OTHER)



def check_duplicate(db: Session, email: str, phone: str = None) -> bool:
    """
    Check if lead already exists by email or phone.
    
    Args:
        db: Database session
        email: Email to check
        phone: Phone to check (optional)
        
    Returns:
        True if duplicate exists
    """
    # Check by email
    existing = db.query(Lead).filter(Lead.email == email).first()
    if existing:
        return True
    
    # Check by phone if provided
    if phone and phone.strip():
        existing = db.query(Lead).filter(Lead.phone == phone).first()
        if existing:
            return True
    
    return False


def import_leads_from_file(
    db: Session,
    file: UploadFile,
    current_user: User
) -> ImportResult:
    """
    Import leads from Excel/CSV file.
    
    Args:
        db: Database session
        file: Uploaded file
        current_user: User performing the import
        
    Returns:
        ImportResult with summary of import operation
    """
    result = ImportResult()
    
    # Validate file type
    file_type = validate_file_type(file.filename)
    
    # Read file content
    try:
        content = file.file.read()
        
        if file_type == 'csv':
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read file: {str(e)}"
        )
    
    # Validate columns
    df.columns = df.columns.str.lower().str.strip()
    missing_cols = validate_columns(df)
    if missing_cols:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing required columns: {', '.join(missing_cols)}"
        )
    
    result.total_rows = len(df)
    
    # Determine assignment based on role
    assigned_to_id = None
    if current_user.role == UserRole.SALES:
        # Sales imports to themselves
        assigned_to_id = current_user.id
    elif current_user.role == UserRole.MANAGER:
        # Manager can optionally assign (default: unassigned for team)
        assigned_to_id = None
    # Admin: unassigned by default
    
    # Process each row
    for idx, row in df.iterrows():
        row_num = idx + 2  # Excel row number (1-indexed + header)
        
        try:
            # Extract and validate data
            full_name = str(row.get('full_name', '')).strip()
            email = str(row.get('email', '')).strip().lower()
            phone = str(row.get('phone', '')).strip() if pd.notna(row.get('phone')) else None
            source = normalize_source(row.get('source'))
            
            # Validate required fields
            if not full_name:
                result.errors.append({
                    "row": row_num,
                    "field": "full_name",
                    "error": "Full name is required"
                })
                continue
            
            if not email or '@' not in email:
                result.errors.append({
                    "row": row_num,
                    "field": "email",
                    "error": "Valid email is required"
                })
                continue
            
            # Check for duplicates
            if check_duplicate(db, email, phone):
                result.skipped_duplicates += 1
                continue
            
            # Create lead
            lead_data = LeadCreate(
                full_name=full_name,
                email=email,
                phone=phone if phone else None,
                source=source,
                status=LeadStatus.NEW,
                assigned_to_id=assigned_to_id
            )
            
            lead = lead_crud.create_lead(
                db=db,
                lead=lead_data,
                created_by_id=current_user.id
            )
            
            result.inserted += 1
            result.inserted_leads.append(lead.id)
            
        except Exception as e:
            result.errors.append({
                "row": row_num,
                "error": str(e)
            })
    
    return result


def can_import_leads(user: User) -> bool:
    """
    Check if user has permission to import leads.
    
    Rules:
    - Admin & Manager: Can import leads
    - Sales: Cannot import leads (too powerful)
    
    Args:
        user: Current user
        
    Returns:
        bool: True if user can import
    """
    return user.role in [UserRole.ADMIN, UserRole.MANAGER]
