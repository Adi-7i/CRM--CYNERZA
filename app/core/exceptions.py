"""
Custom exception classes for the CRM application.
Provides standardized error handling across the application.
"""
from typing import Optional, Any, Dict


class CRMException(Exception):
    """
    Base exception class for CRM application.
    All custom exceptions should inherit from this.
    """
    def __init__(
        self,
        message: str,
        code: str = "CRM_ERROR",
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class NotFoundError(CRMException):
    """Raised when a requested resource is not found."""
    def __init__(self, resource: str, identifier: Any = None):
        message = f"{resource} not found"
        if identifier:
            message = f"{resource} with ID {identifier} not found"
        super().__init__(
            message=message,
            code="NOT_FOUND",
            status_code=404,
            details={"resource": resource, "identifier": identifier}
        )


class PermissionDeniedError(CRMException):
    """Raised when user doesn't have permission to perform an action."""
    def __init__(self, action: str = "perform this action"):
        super().__init__(
            message=f"You don't have permission to {action}",
            code="PERMISSION_DENIED",
            status_code=403,
            details={"action": action}
        )


class ValidationError(CRMException):
    """Raised when input validation fails."""
    def __init__(self, message: str, field: Optional[str] = None):
        details = {"field": field} if field else {}
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=400,
            details=details
        )


class AuthenticationError(CRMException):
    """Raised when authentication fails."""
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(
            message=message,
            code="AUTHENTICATION_ERROR",
            status_code=401
        )


class DuplicateError(CRMException):
    """Raised when attempting to create a duplicate resource."""
    def __init__(self, resource: str, field: str = "value"):
        super().__init__(
            message=f"{resource} with this {field} already exists",
            code="DUPLICATE_ERROR",
            status_code=409,
            details={"resource": resource, "field": field}
        )


class BusinessLogicError(CRMException):
    """Raised when a business rule is violated."""
    def __init__(self, message: str, rule: Optional[str] = None):
        super().__init__(
            message=message,
            code="BUSINESS_LOGIC_ERROR",
            status_code=422,
            details={"rule": rule} if rule else {}
        )
