"""
Analyzer service for Phase 1: Upload & Analysis.
Handles file parsing, column detection, and auto-mapping suggestions.
"""
import io
import hashlib
from typing import List, Dict, Any, Optional, Tuple
import pandas as pd
from fastapi import UploadFile, HTTPException, status

from app.models.lead import LeadSource


# CRM field definitions for mapping
CRM_FIELDS = {
    "full_name": {"type": "string", "required": True, "aliases": ["name", "fullname", "full name", "contact name", "lead name"]},
    "first_name": {"type": "string", "required": False, "aliases": ["firstname", "first", "fname", "given name"]},
    "last_name": {"type": "string", "required": False, "aliases": ["lastname", "last", "lname", "surname", "family name"]},
    "email": {"type": "email", "required": True, "aliases": ["e-mail", "email address", "emailaddress", "mail"]},
    "phone": {"type": "phone", "required": False, "aliases": ["telephone", "tel", "mobile", "cell", "phone number", "phonenumber", "contact number"]},
    "company": {"type": "string", "required": False, "aliases": ["company name", "organization", "org", "business", "employer"]},
    "source": {"type": "enum", "required": False, "aliases": ["lead source", "leadsource", "origin", "channel"]},
    "notes": {"type": "text", "required": False, "aliases": ["note", "comments", "comment", "description", "remarks"]},
}

# Patterns for auto-detection
EMAIL_PATTERN = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
PHONE_PATTERN = r'^[\+]?[\d\s\-\(\)]{7,20}$'


class AnalyzerService:
    """Service for analyzing uploaded files and suggesting mappings."""
    
    @staticmethod
    def validate_file(file: UploadFile) -> str:
        """
        Validate uploaded file type.
        
        Returns:
            File type: 'csv' or 'xlsx'
        """
        filename = file.filename.lower()
        
        if filename.endswith('.csv'):
            return 'csv'
        elif filename.endswith('.xlsx') or filename.endswith('.xls'):
            return 'xlsx'
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file type. Please upload .csv or .xlsx file."
            )
    
    @staticmethod
    def read_file(file_content: bytes, file_type: str) -> pd.DataFrame:
        """
        Read file content into DataFrame.
        
        Args:
            file_content: Raw file bytes
            file_type: 'csv' or 'xlsx'
            
        Returns:
            Pandas DataFrame
        """
        try:
            if file_type == 'csv':
                # Try different encodings
                for encoding in ['utf-8', 'latin-1', 'cp1252']:
                    try:
                        df = pd.read_csv(io.BytesIO(file_content), encoding=encoding)
                        break
                    except UnicodeDecodeError:
                        continue
                else:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Unable to decode CSV file. Please use UTF-8 encoding."
                    )
            else:
                df = pd.read_excel(io.BytesIO(file_content))
            
            return df
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to read file: {str(e)}"
            )
    
    @staticmethod
    def clean_columns(df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
        """
        Clean and normalize column names, remove empty columns.
        
        Returns:
            Tuple of (cleaned DataFrame, list of removed columns)
        """
        removed = []
        
        # Normalize column names
        df.columns = df.columns.astype(str).str.strip().str.lower()
        
        # Remove unnamed columns
        unnamed_cols = [col for col in df.columns if col.startswith('unnamed')]
        if unnamed_cols:
            df = df.drop(columns=unnamed_cols)
            removed.extend(unnamed_cols)
        
        # Remove completely empty columns
        empty_cols = df.columns[df.isna().all()].tolist()
        if empty_cols:
            df = df.drop(columns=empty_cols)
            removed.extend(empty_cols)
        
        # Remove columns with > 90% empty values
        threshold = len(df) * 0.1
        sparse_cols = [col for col in df.columns if df[col].notna().sum() < threshold]
        if sparse_cols:
            df = df.drop(columns=sparse_cols)
            removed.extend(sparse_cols)
        
        return df, removed
    
    @staticmethod
    def suggest_mappings(df: pd.DataFrame) -> Dict[str, str]:
        """
        Auto-detect CRM field mappings based on column names and content.
        
        Returns:
            Dict mapping column names to CRM field names
        """
        suggestions = {}
        used_fields = set()
        
        for col in df.columns:
            col_lower = col.lower().strip()
            
            # Check alias matches
            for field_name, field_def in CRM_FIELDS.items():
                if field_name in used_fields:
                    continue
                    
                if col_lower == field_name or col_lower in field_def["aliases"]:
                    suggestions[col] = field_name
                    used_fields.add(field_name)
                    break
            else:
                # Content-based detection for unmatched columns
                sample = df[col].dropna().head(100)
                
                if len(sample) > 0:
                    # Check if looks like email
                    if "email" not in used_fields:
                        email_matches = sample.astype(str).str.match(EMAIL_PATTERN, na=False).sum()
                        if email_matches / len(sample) > 0.8:
                            suggestions[col] = "email"
                            used_fields.add("email")
                            continue
                    
                    # Check if looks like phone
                    if "phone" not in used_fields:
                        phone_matches = sample.astype(str).str.match(PHONE_PATTERN, na=False).sum()
                        if phone_matches / len(sample) > 0.7:
                            suggestions[col] = "phone"
                            used_fields.add("phone")
                            continue
        
        return suggestions
    
    @staticmethod
    def get_sample_rows(df: pd.DataFrame, count: int = 5) -> List[Dict[str, Any]]:
        """
        Get sample rows for preview.
        
        Args:
            df: DataFrame
            count: Number of rows to return
            
        Returns:
            List of row dictionaries
        """
        sample_df = df.head(count).fillna("")
        return sample_df.to_dict(orient='records')
    
    @staticmethod
    def generate_column_signature(columns: List[str]) -> str:
        """
        Generate a signature hash for column set matching.
        Used to suggest previously used templates.
        
        Args:
            columns: List of column names
            
        Returns:
            MD5 hash of sorted column names
        """
        normalized = sorted([col.lower().strip() for col in columns])
        return hashlib.md5("|".join(normalized).encode()).hexdigest()
    
    def analyze(self, file: UploadFile) -> Dict[str, Any]:
        """
        Complete analysis of uploaded file.
        
        Args:
            file: Uploaded file
            
        Returns:
            Analysis results with columns, mappings, and samples
        """
        # Validate and read file
        file_type = self.validate_file(file)
        file_content = file.file.read()
        file.file.seek(0)  # Reset for potential reuse
        
        df = self.read_file(file_content, file_type)
        
        if df.empty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File is empty or contains no data rows."
            )
        
        # Clean columns
        df, removed_columns = self.clean_columns(df)
        
        if len(df.columns) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid columns found after cleaning."
            )
        
        # Generate analysis
        columns = df.columns.tolist()
        suggestions = self.suggest_mappings(df)
        samples = self.get_sample_rows(df)
        signature = self.generate_column_signature(columns)
        
        return {
            "file_name": file.filename,
            "file_content": file_content,
            "total_rows": len(df),
            "detected_columns": columns,
            "removed_columns": removed_columns,
            "suggested_mappings": suggestions,
            "sample_rows": samples,
            "column_signature": signature,
            "available_crm_fields": list(CRM_FIELDS.keys())
        }
