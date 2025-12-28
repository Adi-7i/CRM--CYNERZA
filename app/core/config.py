"""
Application configuration using Pydantic Settings.
Loads configuration from environment variables.
"""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import validator


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """
    
    # Application Info
    PROJECT_NAME: str = "Enterprise CRM"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database Configuration
    DATABASE_URL: str = "sqlite:///./crm.db"
    
    # Security & JWT
    SECRET_KEY: str
    JWT_SECRET_KEY: str = ""  # Will default to SECRET_KEY if not provided
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]
    
    # Environment
    ENVIRONMENT: str = "development"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="allow"
    )
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v):
        """
        Parse CORS origins from string or list.
        """
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        return v
    
    @validator("JWT_SECRET_KEY", pre=True, always=True)
    def set_jwt_secret_key(cls, v, values):
        """
        Use SECRET_KEY if JWT_SECRET_KEY is not provided.
        """
        if not v:
            return values.get("SECRET_KEY")
        return v


# Global settings instance
settings = Settings()
