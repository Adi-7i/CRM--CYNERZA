"""
Database connection and session management using SQLAlchemy.
Provides database engine, session factory, and dependency injection for FastAPI.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.core.config import settings


# Create SQLAlchemy engine
# For SQLite, we need to set check_same_thread=False to allow usage across threads
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    echo=True if settings.ENVIRONMENT == "development" else False,  # Log SQL queries in development
    pool_pre_ping=True,  # Verify connections before using them
)

# Create SessionLocal class for database sessions
# autocommit=False: Don't commit automatically
# autoflush=False: Don't flush automatically
# bind=engine: Bind to our engine
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function that yields database sessions.
    Used with FastAPI's Depends() to inject database sessions into route handlers.
    
    Usage:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    
    Yields:
        Session: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
