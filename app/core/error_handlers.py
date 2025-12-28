"""
Global exception handlers for FastAPI application.
Provides consistent error responses across the API.
"""
import logging
import traceback
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
import uuid

from app.core.exceptions import CRMException
from app.core.config import settings

logger = logging.getLogger(__name__)


def create_error_response(
    request_id: str,
    code: str,
    message: str,
    status_code: int,
    details: dict = None
) -> JSONResponse:
    """
    Create a standardized error response.
    """
    content = {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "details": details if settings.DEBUG else None
        },
        "request_id": request_id
    }
    return JSONResponse(status_code=status_code, content=content)


async def crm_exception_handler(request: Request, exc: CRMException) -> JSONResponse:
    """Handler for custom CRM exceptions."""
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    
    logger.warning(
        f"CRM Exception: {exc.code} - {exc.message}",
        extra={
            "request_id": request_id,
            "error_code": exc.code,
            "details": exc.details
        }
    )
    
    return create_error_response(
        request_id=request_id,
        code=exc.code,
        message=exc.message,
        status_code=exc.status_code,
        details=exc.details
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handler for FastAPI HTTPExceptions."""
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    
    code_map = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        405: "METHOD_NOT_ALLOWED",
        422: "UNPROCESSABLE_ENTITY",
        429: "TOO_MANY_REQUESTS",
        500: "INTERNAL_ERROR"
    }
    
    return create_error_response(
        request_id=request_id,
        code=code_map.get(exc.status_code, "HTTP_ERROR"),
        message=str(exc.detail),
        status_code=exc.status_code
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handler for request validation errors."""
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    
    errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"])
        errors.append({
            "field": field,
            "message": error["msg"],
            "type": error["type"]
        })
    
    return create_error_response(
        request_id=request_id,
        code="VALIDATION_ERROR",
        message="Request validation failed",
        status_code=422,
        details={"errors": errors}
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handler for unhandled exceptions."""
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    
    # Log the full traceback for debugging
    logger.error(
        f"Unhandled exception: {str(exc)}",
        extra={
            "request_id": request_id,
            "traceback": traceback.format_exc()
        }
    )
    
    # Hide internal details in production
    message = str(exc) if settings.DEBUG else "An unexpected error occurred"
    
    return create_error_response(
        request_id=request_id,
        code="INTERNAL_ERROR",
        message=message,
        status_code=500,
        details={"traceback": traceback.format_exc()} if settings.DEBUG else None
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Register all exception handlers with the FastAPI app."""
    app.add_exception_handler(CRMException, crm_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)
