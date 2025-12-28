"""
Input validation and sanitization utilities.
"""
import re
import html
from typing import Optional


def sanitize_string(value: str) -> str:
    """
    Sanitize a string input to prevent XSS attacks.
    
    Args:
        value: Input string to sanitize
        
    Returns:
        Sanitized string with HTML entities escaped
    """
    if not value:
        return value
    
    # Escape HTML entities
    sanitized = html.escape(value, quote=True)
    
    # Remove potential script tags (extra safety)
    sanitized = re.sub(r'<script[^>]*>.*?</script>', '', sanitized, flags=re.IGNORECASE | re.DOTALL)
    
    return sanitized.strip()


def validate_email(email: str) -> bool:
    """
    Validate email format.
    
    Args:
        email: Email address to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not email:
        return False
    
    # RFC 5322 compliant email regex (simplified)
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_phone(phone: str) -> bool:
    """
    Validate phone number format.
    
    Args:
        phone: Phone number to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not phone:
        return True  # Phone is often optional
    
    # Remove common separators
    cleaned = re.sub(r'[\s\-\(\)\.]', '', phone)
    
    # Check if it contains only digits and optional + prefix
    pattern = r'^\+?[0-9]{7,15}$'
    return bool(re.match(pattern, cleaned))


def normalize_phone(phone: str) -> Optional[str]:
    """
    Normalize phone number to standard format.
    
    Args:
        phone: Phone number to normalize
        
    Returns:
        Normalized phone number or None if invalid
    """
    if not phone:
        return None
    
    # Remove all non-digit characters except +
    cleaned = re.sub(r'[^\d+]', '', phone)
    
    if not validate_phone(cleaned):
        return None
    
    return cleaned


def sanitize_search_query(query: str, max_length: int = 100) -> str:
    """
    Sanitize a search query string.
    
    Args:
        query: Search query to sanitize
        max_length: Maximum allowed length
        
    Returns:
        Sanitized search query
    """
    if not query:
        return ""
    
    # Remove special SQL characters (extra safety on top of SQLAlchemy)
    sanitized = re.sub(r'[;\'"\\]', '', query)
    
    # Limit length
    sanitized = sanitized[:max_length]
    
    return sanitized.strip()


def validate_date_range(start_date, end_date) -> bool:
    """
    Validate that start_date is before or equal to end_date.
    
    Args:
        start_date: Start date
        end_date: End date
        
    Returns:
        True if valid range, False otherwise
    """
    if start_date is None or end_date is None:
        return True
    
    return start_date <= end_date


def validate_pagination(skip: int, limit: int, max_limit: int = 500) -> tuple:
    """
    Validate and normalize pagination parameters.
    
    Args:
        skip: Number of records to skip
        limit: Number of records to return
        max_limit: Maximum allowed limit
        
    Returns:
        Tuple of (normalized_skip, normalized_limit)
    """
    normalized_skip = max(0, skip)
    normalized_limit = min(max(1, limit), max_limit)
    
    return normalized_skip, normalized_limit
