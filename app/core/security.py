"""
Security utilities for password hashing and verification.
Uses bcrypt directly for secure password hashing.
"""
import bcrypt


def hash_password(password: str) -> str:
    """
    Hash a plain-text password using bcrypt.
    Bcrypt has a 72-byte limit, so we truncate the password bytes if needed.
    
    Args:
        password: Plain-text password to hash
        
    Returns:
        str: Hashed password
    """
    # Encode password to bytes
    password_bytes = password.encode('utf-8')
    
    # Truncate to 72 bytes if needed (bcrypt limit)
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    
    # Return as string
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against a hashed password.
    
    Args:
        plain_password: Plain-text password to verify
        hashed_password: Hashed password to compare against
        
    Returns:
        bool: True if password matches, False otherwise
    """
    # Encode password to bytes
    password_bytes = plain_password.encode('utf-8')
    
    # Truncate to 72 bytes if needed (same as hashing)
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    # Encode hashed password to bytes
    hashed_bytes = hashed_password.encode('utf-8')
    
    # Check password
    return bcrypt.checkpw(password_bytes, hashed_bytes)
