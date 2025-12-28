"""
Application configuration settings.
Uses environment variables for secure configuration management.
"""
import os
from typing import List
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """
    # Basic App Settings
    PROJECT_NAME: str = "Enterprise CRM"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Enterprise-grade Customer Relationship Management System"
    API_V1_STR: str = "/api/v1"
    
    # Environment Settings
    ENVIRONMENT: str = "development"  # development, staging, production
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"  # DEBUG, INFO, WARNING, ERROR, CRITICAL
    
    # Security Settings
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database Settings
    DATABASE_URL: str = "sqlite:///./crm.db"
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_RECYCLE: int = 300
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8080"]
    
    # Pagination Settings
    DEFAULT_PAGE_SIZE: int = 50
    MAX_PAGE_SIZE: int = 500
    
    # Rate Limiting (future use)
    RATE_LIMIT_PER_MINUTE: int = 100
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.ENVIRONMENT == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.ENVIRONMENT == "development"


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Uses LRU cache to avoid repeated environment variable reads.
    """
    return Settings()


# Global settings instance
settings = get_settings()
