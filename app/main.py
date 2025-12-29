"""
Main FastAPI application entry point.
Production-ready with error handling, logging, and middleware.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.logging_config import setup_logging, get_logger
from app.core.error_handlers import register_exception_handlers
from app.middleware.logging_middleware import RequestLoggingMiddleware
from app.api.v1.endpoints import users, auth, leads, customers, deals, tasks, analytics, health, lead_import
from app.models.base import Base
from app.core.database import engine


# Setup logging before anything else
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan events.
    Handles startup and shutdown logic.
    """
    # Startup
    logger.info(
        f"Starting {settings.PROJECT_NAME} v{settings.VERSION}",
        extra={"environment": settings.ENVIRONMENT}
    )
    
    # Create database tables if they don't exist
    # Note: In production, use Alembic migrations instead
    Base.metadata.create_all(bind=engine)
    
    yield
    
    # Shutdown
    logger.info(f"Shutting down {settings.PROJECT_NAME}")


# Initialize FastAPI application with enhanced OpenAPI docs
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
## Enterprise CRM Backend API

A comprehensive Customer Relationship Management system with:

### Features
- **Lead Management**: Track and nurture sales leads
- **Customer Management**: Manage customer relationships and interactions
- **Deal/Opportunity Management**: Pipeline with Kanban-ready data
- **Task & Follow-Up Management**: Task tracking with entity relationships
- **Analytics & Dashboard**: Business insights and KPIs

### Authentication
All endpoints require JWT authentication except public health checks.
Use `/api/v1/auth/login` to obtain access tokens.

### Roles
- **Admin**: Full system access
- **Manager**: Team-level access
- **Sales**: Own records only
    """,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan,
    openapi_tags=[
        {"name": "authentication", "description": "User authentication and token management"},
        {"name": "users", "description": "User management (admin only)"},
        {"name": "leads", "description": "Lead management and tracking"},
        {"name": "lead-import", "description": "Smart lead import with mapping and deduplication"},
        {"name": "customers", "description": "Customer management and interactions"},
        {"name": "deals", "description": "Deal/Opportunity pipeline management"},
        {"name": "tasks", "description": "Task and follow-up management"},
        {"name": "analytics", "description": "Dashboard and business analytics"},
        {"name": "health", "description": "Health checks and monitoring"},
    ]
)


# Register exception handlers
register_exception_handlers(app)


# Add middleware (order matters - first added = last executed)
# Request logging middleware
app.add_middleware(RequestLoggingMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
# Health check routes (no auth required)
app.include_router(
    health.router,
    prefix=f"{settings.API_V1_STR}/health",
    tags=["health"]
)

# Authentication routes
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["authentication"]
)

# User management routes
app.include_router(
    users.router,
    prefix=f"{settings.API_V1_STR}/users",
    tags=["users"]
)

# Lead management routes
app.include_router(
    leads.router,
    prefix=f"{settings.API_V1_STR}/leads",
    tags=["leads"]
)

# Customer management routes
app.include_router(
    customers.router,
    prefix=f"{settings.API_V1_STR}/customers",
    tags=["customers"]
)

# Deal/Opportunity management routes
app.include_router(
    deals.router,
    prefix=f"{settings.API_V1_STR}/deals",
    tags=["deals"]
)

# Task & Follow-Up management routes
app.include_router(
    tasks.router,
    prefix=f"{settings.API_V1_STR}/tasks",
    tags=["tasks"]
)

# Analytics & Dashboard routes
app.include_router(
    analytics.router,
    prefix=f"{settings.API_V1_STR}/analytics",
    tags=["analytics"]
)

# Smart Lead Import routes
app.include_router(
    lead_import.router,
    prefix=f"{settings.API_V1_STR}/leads/import",
    tags=["lead-import"]
)


@app.get("/", include_in_schema=False)
def root():
    """
    Root endpoint - Basic info and health check redirect.
    """
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": "/docs" if settings.DEBUG else "Disabled in production",
        "health": f"{settings.API_V1_STR}/health"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.is_development,
        log_level=settings.LOG_LEVEL.lower()
    )
