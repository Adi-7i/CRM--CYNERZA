"""
Middleware package for CRM application.
"""
from app.middleware.logging_middleware import RequestLoggingMiddleware

__all__ = ["RequestLoggingMiddleware"]
