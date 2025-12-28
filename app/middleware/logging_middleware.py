"""
Request logging middleware for tracking API requests.
"""
import time
import uuid
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for logging HTTP requests and responses.
    Adds request ID tracking and timing information.
    """
    
    async def dispatch(self, request: Request, call_next) -> Response:
        # Generate unique request ID
        request_id = str(uuid.uuid4())[:8]
        request.state.request_id = request_id
        
        # Record start time
        start_time = time.time()
        
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Log incoming request
        logger.info(
            f"Request started: {request.method} {request.url.path}",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "client_ip": client_ip,
                "query_params": str(request.query_params)
            }
        )
        
        # Process request
        try:
            response = await call_next(request)
        except Exception as e:
            # Log error and re-raise
            duration_ms = round((time.time() - start_time) * 1000, 2)
            logger.error(
                f"Request failed: {request.method} {request.url.path}",
                extra={
                    "request_id": request_id,
                    "duration_ms": duration_ms,
                    "error": str(e)
                }
            )
            raise
        
        # Calculate duration
        duration_ms = round((time.time() - start_time) * 1000, 2)
        
        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time"] = f"{duration_ms}ms"
        
        # Log completed request
        log_level = logging.INFO if response.status_code < 400 else logging.WARNING
        logger.log(
            log_level,
            f"Request completed: {request.method} {request.url.path} - {response.status_code}",
            extra={
                "request_id": request_id,
                "status_code": response.status_code,
                "duration_ms": duration_ms
            }
        )
        
        return response
