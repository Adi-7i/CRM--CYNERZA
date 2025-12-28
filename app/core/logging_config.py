"""
Structured logging configuration for the CRM application.
Provides JSON formatted logs for production environments.
"""
import logging
import sys
import json
from datetime import datetime
from typing import Optional
from pathlib import Path

from app.core.config import settings


class JSONFormatter(logging.Formatter):
    """
    Custom JSON formatter for structured logging.
    Outputs logs in JSON format for easy parsing by log aggregators.
    """
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        # Add extra fields if present
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id
        if hasattr(record, "action"):
            log_data["action"] = record.action
        if hasattr(record, "duration_ms"):
            log_data["duration_ms"] = record.duration_ms
        if hasattr(record, "error_code"):
            log_data["error_code"] = record.error_code
        if hasattr(record, "details"):
            log_data["details"] = record.details
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)


class SimpleFormatter(logging.Formatter):
    """
    Simple colored formatter for development environments.
    """
    COLORS = {
        "DEBUG": "\033[36m",     # Cyan
        "INFO": "\033[32m",      # Green
        "WARNING": "\033[33m",   # Yellow
        "ERROR": "\033[31m",     # Red
        "CRITICAL": "\033[35m",  # Magenta
    }
    RESET = "\033[0m"
    
    def format(self, record: logging.LogRecord) -> str:
        color = self.COLORS.get(record.levelname, self.RESET)
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        message = f"{color}[{timestamp}] {record.levelname:8}{self.RESET} | {record.name} | {record.getMessage()}"
        
        if hasattr(record, "request_id"):
            message += f" | req_id={record.request_id}"
        if hasattr(record, "duration_ms"):
            message += f" | {record.duration_ms}ms"
        
        return message


def setup_logging() -> None:
    """
    Configure logging based on environment settings.
    """
    # Determine log level from settings
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    
    # Create root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Remove existing handlers
    root_logger.handlers = []
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    
    # Use JSON formatter for production, simple formatter for development
    if settings.ENVIRONMENT == "production":
        console_handler.setFormatter(JSONFormatter())
    else:
        console_handler.setFormatter(SimpleFormatter())
    
    root_logger.addHandler(console_handler)
    
    # File handler for production
    if settings.ENVIRONMENT == "production":
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        
        file_handler = logging.FileHandler(log_dir / "crm.log")
        file_handler.setLevel(log_level)
        file_handler.setFormatter(JSONFormatter())
        root_logger.addHandler(file_handler)
    
    # Set third-party loggers to warning level
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Get a logger with the given name."""
    return logging.getLogger(name)


class AuditLogger:
    """
    Audit logger for tracking user actions.
    Records who did what and when.
    """
    def __init__(self):
        self.logger = logging.getLogger("audit")
    
    def log_action(
        self,
        action: str,
        user_id: Optional[int] = None,
        resource: Optional[str] = None,
        resource_id: Optional[int] = None,
        details: Optional[dict] = None,
        request_id: Optional[str] = None
    ) -> None:
        """
        Log an audit action.
        
        Args:
            action: Action performed (e.g., "lead.create", "deal.update")
            user_id: ID of user performing action
            resource: Type of resource affected
            resource_id: ID of resource affected
            details: Additional details about the action
            request_id: Request ID for correlation
        """
        self.logger.info(
            f"AUDIT: {action}",
            extra={
                "action": action,
                "user_id": user_id,
                "resource": resource,
                "resource_id": resource_id,
                "details": details or {},
                "request_id": request_id
            }
        )


# Global audit logger instance
audit_logger = AuditLogger()
