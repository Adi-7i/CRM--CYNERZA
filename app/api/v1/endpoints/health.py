"""
Health check endpoint for monitoring and orchestration.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
import platform
import time

from app.api.deps import get_db
from app.core.config import settings

router = APIRouter()


@router.get("/live")
def liveness_check():
    """
    Liveness probe - indicates if the application is running.
    Used by Kubernetes and load balancers to check if the app is alive.
    
    Returns:
        Simple alive status
    """
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


@router.get("/ready")
def readiness_check(db: Session = Depends(get_db)):
    """
    Readiness probe - indicates if the application is ready to serve traffic.
    Checks database connectivity and other dependencies.
    
    Returns:
        Detailed status of all dependencies
    """
    checks = {}
    is_ready = True
    
    # Check database connectivity
    try:
        start = time.time()
        db.execute(text("SELECT 1"))
        db_latency = round((time.time() - start) * 1000, 2)
        checks["database"] = {
            "status": "healthy",
            "latency_ms": db_latency
        }
    except Exception as e:
        checks["database"] = {
            "status": "unhealthy",
            "error": str(e) if settings.DEBUG else "Connection failed"
        }
        is_ready = False
    
    return {
        "status": "ready" if is_ready else "not_ready",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "checks": checks
    }


@router.get("")
def health_status(db: Session = Depends(get_db)):
    """
    Comprehensive health check with system information.
    
    Returns:
        Full health status including version, environment, and system info
    """
    checks = {}
    
    # Database check
    try:
        start = time.time()
        db.execute(text("SELECT 1"))
        db_latency = round((time.time() - start) * 1000, 2)
        checks["database"] = {
            "status": "healthy",
            "latency_ms": db_latency
        }
    except Exception as e:
        checks["database"] = {
            "status": "unhealthy",
            "error": str(e) if settings.DEBUG else "Connection failed"
        }
    
    # Determine overall status
    all_healthy = all(
        check.get("status") == "healthy"
        for check in checks.values()
    )
    
    response = {
        "status": "healthy" if all_healthy else "degraded",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "checks": checks
    }
    
    # Add system info in non-production
    if settings.DEBUG:
        response["system"] = {
            "python_version": platform.python_version(),
            "platform": platform.system(),
            "architecture": platform.machine()
        }
    
    return response
