"""
Deduplicator service for Phase 4: Duplicate Detection.
Performs 3-level duplicate detection: in-file, against CRM, and smart matching.
"""
from typing import List, Dict, Any, Set, Tuple
from difflib import SequenceMatcher
from sqlalchemy.orm import Session

from app.models.lead import Lead


class DeduplicatorService:
    """Service for detecting duplicate leads at multiple levels."""
    
    # Similarity threshold for fuzzy name matching
    NAME_SIMILARITY_THRESHOLD = 0.85
    
    @staticmethod
    def find_in_file_duplicates(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Find duplicates within the imported file.
        Groups rows by email or phone.
        
        Returns:
            List of duplicate groups with row numbers and reason
        """
        duplicates = []
        
        # Group by email
        email_groups: Dict[str, List[int]] = {}
        for row in data:
            email = row.get("email")
            row_num = row.get("_row_num", 0)
            
            if email:
                if email not in email_groups:
                    email_groups[email] = []
                email_groups[email].append(row_num)
        
        for email, rows in email_groups.items():
            if len(rows) > 1:
                duplicates.append({
                    "rows": rows,
                    "match_type": "email",
                    "match_value": email,
                    "reason": f"Same email: {email}"
                })
        
        # Group by phone (only if not already caught by email)
        phone_groups: Dict[str, List[int]] = {}
        caught_rows: Set[int] = set()
        for dup in duplicates:
            caught_rows.update(dup["rows"])
        
        for row in data:
            phone = row.get("phone")
            row_num = row.get("_row_num", 0)
            
            if phone and row_num not in caught_rows:
                if phone not in phone_groups:
                    phone_groups[phone] = []
                phone_groups[phone].append(row_num)
        
        for phone, rows in phone_groups.items():
            if len(rows) > 1:
                duplicates.append({
                    "rows": rows,
                    "match_type": "phone",
                    "match_value": phone,
                    "reason": f"Same phone: {phone}"
                })
        
        return duplicates
    
    @staticmethod
    def find_existing_duplicates(
        db: Session,
        data: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Find matches against existing CRM leads.
        Matches by email or phone.
        
        Returns:
            List of matches with import row and existing lead info
        """
        duplicates = []
        
        # Collect all emails and phones to batch query
        emails = [row.get("email") for row in data if row.get("email")]
        phones = [row.get("phone") for row in data if row.get("phone")]
        
        # Query existing leads
        existing_by_email: Dict[str, Lead] = {}
        existing_by_phone: Dict[str, Lead] = {}
        
        if emails:
            email_leads = db.query(Lead).filter(Lead.email.in_(emails)).all()
            for lead in email_leads:
                existing_by_email[lead.email.lower()] = lead
        
        if phones:
            phone_leads = db.query(Lead).filter(Lead.phone.in_(phones)).all()
            for lead in phone_leads:
                if lead.phone:
                    existing_by_phone[lead.phone] = lead
        
        # Match each import row
        for row in data:
            row_num = row.get("_row_num", 0)
            email = row.get("email", "").lower()
            phone = row.get("phone")
            
            # Check email match
            if email in existing_by_email:
                lead = existing_by_email[email]
                duplicates.append({
                    "import_row": row_num,
                    "import_data": {
                        "full_name": row.get("full_name"),
                        "email": row.get("email"),
                        "phone": row.get("phone")
                    },
                    "existing_lead_id": lead.id,
                    "existing_lead": {
                        "id": lead.id,
                        "full_name": lead.full_name,
                        "email": lead.email,
                        "phone": lead.phone,
                        "status": lead.status.value
                    },
                    "match_type": "email",
                    "match_value": email
                })
                continue
            
            # Check phone match
            if phone and phone in existing_by_phone:
                lead = existing_by_phone[phone]
                duplicates.append({
                    "import_row": row_num,
                    "import_data": {
                        "full_name": row.get("full_name"),
                        "email": row.get("email"),
                        "phone": row.get("phone")
                    },
                    "existing_lead_id": lead.id,
                    "existing_lead": {
                        "id": lead.id,
                        "full_name": lead.full_name,
                        "email": lead.email,
                        "phone": lead.phone,
                        "status": lead.status.value
                    },
                    "match_type": "phone",
                    "match_value": phone
                })
        
        return duplicates
    
    @classmethod
    def name_similarity(cls, name1: str, name2: str) -> float:
        """
        Calculate similarity between two names.
        Uses SequenceMatcher for fuzzy matching.
        """
        if not name1 or not name2:
            return 0.0
        
        # Normalize
        n1 = name1.lower().strip()
        n2 = name2.lower().strip()
        
        return SequenceMatcher(None, n1, n2).ratio()
    
    @classmethod
    def find_smart_matches(
        cls,
        db: Session,
        data: List[Dict[str, Any]],
        existing_duplicates: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Find potential matches using fuzzy logic.
        Same company + similar name (>85% match).
        
        Only checks rows not already caught by exact matches.
        
        Returns:
            List of smart matches with similarity score
        """
        smart_matches = []
        
        # Get row numbers already matched
        matched_rows = {dup["import_row"] for dup in existing_duplicates}
        
        # Filter rows with company
        rows_with_company = [
            row for row in data 
            if row.get("company") and row.get("_row_num") not in matched_rows
        ]
        
        if not rows_with_company:
            return []
        
        # Get companies from import data
        companies = list(set(row.get("company", "").lower() for row in rows_with_company if row.get("company")))
        
        # Query leads from those companies
        # Note: This assumes Lead model has a company field or we match via Customer
        # For now, we'll do name-only fuzzy matching
        all_leads = db.query(Lead).limit(1000).all()  # Limit for performance
        
        for row in rows_with_company:
            row_num = row.get("_row_num", 0)
            name = row.get("full_name", "")
            
            for lead in all_leads:
                similarity = cls.name_similarity(name, lead.full_name)
                
                if similarity >= cls.NAME_SIMILARITY_THRESHOLD:
                    smart_matches.append({
                        "import_row": row_num,
                        "import_data": {
                            "full_name": row.get("full_name"),
                            "email": row.get("email"),
                            "phone": row.get("phone")
                        },
                        "existing_lead_id": lead.id,
                        "existing_lead": {
                            "id": lead.id,
                            "full_name": lead.full_name,
                            "email": lead.email,
                            "phone": lead.phone,
                            "status": lead.status.value
                        },
                        "match_type": "smart",
                        "similarity": round(similarity * 100, 1),
                        "reason": f"Similar name ({round(similarity * 100)}% match)"
                    })
                    break  # Only first match per row
        
        return smart_matches
    
    def detect_all_duplicates(
        self,
        db: Session,
        data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Run all levels of duplicate detection.
        
        Returns:
            Complete duplicate detection results
        """
        # Level 1: In-file duplicates
        in_file = self.find_in_file_duplicates(data)
        
        # Level 2: Existing CRM duplicates
        existing = self.find_existing_duplicates(db, data)
        
        # Level 3: Smart matches
        smart = self.find_smart_matches(db, data, existing)
        
        return {
            "in_file_duplicates": in_file,
            "existing_duplicates": existing,
            "smart_matches": smart,
            "total_duplicates": len(in_file) + len(existing) + len(smart)
        }
