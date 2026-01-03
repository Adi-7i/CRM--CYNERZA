"""
Normalizer service for Phase 3: Data Cleaning.
Handles data validation, normalization, and transformation.
"""
import re
from typing import List, Dict, Any, Tuple, Optional
import pandas as pd

from app.models.lead import LeadSource


class NormalizerService:
    """Service for normalizing and validating imported lead data."""
    
    # Phone normalization patterns
    PHONE_CHARS_TO_REMOVE = re.compile(r'[^\d+]')
    
    # Email validation pattern
    EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    
    # Valid source values (lowercase for matching)
    VALID_SOURCES = {s.value.lower(): s for s in LeadSource}
    SOURCE_ALIASES = {
        'web': LeadSource.WEBSITE,
        'site': LeadSource.WEBSITE,
        'ref': LeadSource.REFERRAL,
        'reference': LeadSource.REFERRAL,
        'ad': LeadSource.CAMPAIGN,
        'ads': LeadSource.CAMPAIGN,
        'marketing': LeadSource.CAMPAIGN,
        'cold': LeadSource.DIRECT,
        'call': LeadSource.DIRECT,
    }
    
    @staticmethod
    def normalize_name(value: Any) -> Optional[str]:
        """
        Normalize a name field.
        - Trim whitespace
        - Title case
        - Remove extra spaces
        """
        if pd.isna(value) or not str(value).strip():
            return None
        
        name = str(value).strip()
        # Remove extra whitespace
        name = ' '.join(name.split())
        # Title case
        name = name.title()
        return name
    
    @staticmethod
    def merge_names(first_name: Any, last_name: Any) -> Optional[str]:
        """
        Merge first and last name into full name.
        """
        parts = []
        
        if not pd.isna(first_name) and str(first_name).strip():
            parts.append(str(first_name).strip())
        
        if not pd.isna(last_name) and str(last_name).strip():
            parts.append(str(last_name).strip())
        
        if not parts:
            return None
        
        full_name = ' '.join(parts)
        return ' '.join(full_name.split()).title()
    
    @staticmethod
    def normalize_email(value: Any) -> Tuple[Optional[str], Optional[str]]:
        """
        Normalize and validate email.
        
        Returns:
            Tuple of (normalized_email, error_message)
        """
        if pd.isna(value) or not str(value).strip():
            return None, "Email is required"
        
        email = str(value).strip().lower()
        
        # Remove common typos
        email = email.replace(' ', '')
        email = email.replace('..', '.')
        
        # Validate format
        if not NormalizerService.EMAIL_PATTERN.match(email):
            return None, f"Invalid email format: {email}"
        
        return email, None
    
    @staticmethod
    def normalize_phone(value: Any) -> Optional[str]:
        """
        Normalize phone number.
        - Remove non-digit characters (except +)
        - Return None if too short
        """
        if pd.isna(value) or not str(value).strip():
            return None
        
        phone = str(value).strip()
        
        # Keep only digits and leading +
        has_plus = phone.startswith('+')
        digits = NormalizerService.PHONE_CHARS_TO_REMOVE.sub('', phone)
        
        if len(digits) < 7:
            return None  # Too short to be valid
        
        if has_plus and not digits.startswith('+'):
            digits = '+' + digits
        
        return digits
    
    @classmethod
    def normalize_source(cls, value: Any) -> LeadSource:
        """
        Normalize source to valid enum value.
        """
        if pd.isna(value) or not str(value).strip():
            return LeadSource.OTHER
        
        source_lower = str(value).strip().lower()
        
        # Check direct match
        if source_lower in cls.VALID_SOURCES:
            return cls.VALID_SOURCES[source_lower]
        
        # Check aliases
        if source_lower in cls.SOURCE_ALIASES:
            return cls.SOURCE_ALIASES[source_lower]
        
        return LeadSource.OTHER
    
    @staticmethod
    def normalize_text(value: Any) -> Optional[str]:
        """
        Generic text normalization.
        """
        if pd.isna(value) or not str(value).strip():
            return None
        
        return str(value).strip()
    
    def apply_merge_rules(self, row: Dict[str, Any], merge_rules: List[Dict]) -> Dict[str, Any]:
        """
        Apply merge rules to combine columns.
        
        Merge rule format:
        {
            "target": "full_name",
            "sources": ["first_name", "last_name"],
            "separator": " "
        }
        """
        result = row.copy()
        
        for rule in merge_rules:
            target = rule.get("target")
            sources = rule.get("sources", [])
            separator = rule.get("separator", " ")
            
            if not target or not sources:
                continue
            
            # Collect non-empty values from sources
            values = []
            for source in sources:
                if source in result and result[source]:
                    val = str(result[source]).strip()
                    if val:
                        values.append(val)
            
            if values:
                result[target] = separator.join(values)
        
        return result
    
    def normalize_row(
        self, 
        row: Dict[str, Any], 
        mappings: Dict[str, str],
        merge_rules: List[Dict] = None
    ) -> Tuple[Dict[str, Any], List[Dict[str, str]]]:
        """
        Normalize a single row of data.
        
        Args:
            row: Raw row data with original column names
            mappings: Column name to CRM field mappings
            merge_rules: Optional merge rules
            
        Returns:
            Tuple of (normalized_data, list_of_errors)
        """
        errors = []
        normalized = {}
        
        # Map columns to CRM fields
        mapped_row = {}
        for col, value in row.items():
            if col in mappings:
                crm_field = mappings[col]
                mapped_row[crm_field] = value
        
        # Apply merge rules if any
        if merge_rules:
            mapped_row = self.apply_merge_rules(mapped_row, merge_rules)
        
        # Normalize each field
        # Full name
        if "full_name" in mapped_row:
            normalized["full_name"] = self.normalize_name(mapped_row["full_name"])
        elif "first_name" in mapped_row or "last_name" in mapped_row:
            normalized["full_name"] = self.merge_names(
                mapped_row.get("first_name"),
                mapped_row.get("last_name")
            )
        
        if not normalized.get("full_name"):
            errors.append({"field": "full_name", "error": "Name is required"})
        
        # Email
        if "email" in mapped_row:
            email, email_error = self.normalize_email(mapped_row["email"])
            if email:
                normalized["email"] = email
            if email_error:
                errors.append({"field": "email", "error": email_error})
        else:
            errors.append({"field": "email", "error": "Email is required"})
        
        # Phone (optional)
        if "phone" in mapped_row:
            normalized["phone"] = self.normalize_phone(mapped_row["phone"])
        
        # Company (optional)
        if "company" in mapped_row:
            normalized["company"] = self.normalize_text(mapped_row["company"])
        
        # Source
        if "source" in mapped_row:
            normalized["source"] = self.normalize_source(mapped_row["source"])
        else:
            normalized["source"] = LeadSource.OTHER
        
        # Notes (optional)
        if "notes" in mapped_row:
            normalized["notes"] = self.normalize_text(mapped_row["notes"])
        
        return normalized, errors
    
    def normalize_data(
        self,
        data: List[Dict[str, Any]],
        mappings: Dict[str, str],
        merge_rules: List[Dict] = None
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Normalize all rows of imported data.
        
        Returns:
            Tuple of (valid_rows, invalid_rows)
        """
        valid_rows = []
        invalid_rows = []
        
        for idx, row in enumerate(data):
            row_num = idx + 2  # Excel row number (1-indexed + header)
            
            normalized, errors = self.normalize_row(row, mappings, merge_rules)
            
            if errors:
                invalid_rows.append({
                    "row": row_num,
                    "original": row,
                    "normalized": normalized,
                    "errors": errors
                })
            else:
                normalized["_row_num"] = row_num
                valid_rows.append(normalized)
        
        return valid_rows, invalid_rows
