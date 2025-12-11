"""
Environment configuration settings.
Loads environment variables from .env.local in the project root.
"""

import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    DATABASE_URL: str

    # OpenAI API
    OPENAI_API_KEY: str

    # Cloudflare R2 (Optional - uses local storage if not configured)
    R2_ACCOUNT_ID: Optional[str] = None
    R2_ACCESS_KEY_ID: Optional[str] = None
    R2_SECRET_ACCESS_KEY: Optional[str] = None
    R2_BUCKET_NAME: Optional[str] = None

    # Redis
    REDIS_URL: str

    # Application
    FRONTEND_URL: str = 'http://localhost:3427'
    BACKEND_URL: str = 'http://localhost:8567'
    CORS_ORIGIN: str = 'http://localhost:3427'
    ENVIRONMENT: str = 'development'  # development, staging, production

    class Config:
        # Load from .env.local in the project root
        env_file = str(Path(__file__).parent.parent.parent / '.env.local')
        env_file_encoding = 'utf-8'
        case_sensitive = True
        extra = 'ignore'  # Ignore extra fields from .env.local


# Global settings instance
settings = Settings()
