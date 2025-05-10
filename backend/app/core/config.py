from typing import List, Optional, Union, Any, Dict, Annotated
from pydantic import AnyHttpUrl, EmailStr, field_validator, model_validator, Field
# Handle PostgresDsn compatibility issues
try:
    from pydantic import PostgresDsn
except ImportError:
    # If PostgresDsn doesn't exist, create a substitute
    from pydantic import AnyUrl
    
    class PostgresDsn(AnyUrl):
        @classmethod
        def build(cls, 
                  scheme: str, 
                  username: Optional[str] = None,
                  password: Optional[str] = None, 
                  host: Optional[str] = None, 
                  port: Optional[str] = None, 
                  path: Optional[str] = None,
                  **kwargs):
            # Simple implementation to build PostgreSQL DSN
            auth = f"{username}:{password}@" if username else ""
            port_str = f":{port}" if port else ""
            path_str = path if path else ""
            return f"{scheme}://{auth}{host}{port_str}{path_str}"

from pydantic_settings import BaseSettings, SettingsConfigDict
import json
import os


class Settings(BaseSettings):
    # API settings
    APP_NAME: str = "Expense Tracker"
    API_V1_STR: str = "/api"
    
    # Debug mode
    DEBUG: bool = False
    
    # SQLite flag
    USE_SQLITE: bool = False
    
    # CORS settings
    BACKEND_CORS_ORIGINS: Union[str, List[str]] = ["https://expense-tracker-git-master-zwetoslaw-gmailcoms-projects.vercel.app", "http://localhost:8000"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str):
            return json.loads(v)
        return v

    # Security settings
    SECRET_KEY: str = "default-insecure-key-for-dev-only"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database settings - add defaults
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "expense_tracker"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: str = "5432"
    DATABASE_URL: Optional[str] = None

    @model_validator(mode="after")
    def assemble_db_connection(self) -> "Settings":
        # If DATABASE_URL is already set from env, use it
        if self.DATABASE_URL:
            return self
        
        # Check for the database URL in environment (for compatibility)
        env_db_url = os.environ.get("DATABASE_URL")
        if env_db_url:
            self.DATABASE_URL = env_db_url
            return self
            
        # Use SQLite for development by default to avoid authentication issues
        if self.USE_SQLITE:
            self.DATABASE_URL = "sqlite:///./expense_tracker.db"
            return self
            
        # Build PostgreSQL connection string if SQLite is not used
        self.DATABASE_URL = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        return self
    
    # Email settings
    MAIL_USERNAME: Optional[str] = None
    MAIL_PASSWORD: Optional[str] = None
    MAIL_FROM: Optional[str] = "test@example.com"
    MAIL_FROM_NAME: Optional[str] = None
    MAIL_PORT: Optional[int] = 587
    MAIL_SERVER: Optional[str] = None
    MAIL_TLS: bool = True
    MAIL_SSL: bool = False
    
    # Frontend URL for links in emails - use str instead of URL types for compatibility
    FRONTEND_URL: str = "https://expense-tracker-git-master-zwetoslaw-gmailcoms-projects.vercel.app"

    # Update from Config class to SettingsConfigDict
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True
    )


# For testing purposes, create a test configuration
class TestSettings(BaseSettings):
    # Test settings don't need to inherit from Settings
    APP_NAME: str = "Expense Tracker Test"
    API_V1_STR: str = "/api"
    
    # Test security settings
    SECRET_KEY: str = "test-secret-key-for-testing-only"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Test database settings (SQLite)
    DATABASE_URL: str = "sqlite:///./test.db"
    
    # Test user - to avoid DB queries for tests
    POSTGRES_USER: str = "test_user"
    POSTGRES_PASSWORD: str = "test_password"
    POSTGRES_DB: str = "test_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: str = "5432"
    
    # For testing, we don't need real email settings
    MAIL_USERNAME: Optional[str] = None
    MAIL_PASSWORD: Optional[str] = None
    MAIL_FROM: Optional[str] = "test@example.com"
    MAIL_FROM_NAME: Optional[str] = "Test"
    MAIL_PORT: Optional[int] = 587
    MAIL_SERVER: Optional[str] = None
    MAIL_TLS: bool = False
    MAIL_SSL: bool = False
    
    # Testing frontend URL
    FRONTEND_URL: str = "https://expense-tracker-git-master-zwetoslaw-gmailcoms-projects.vercel.app"
    
    # Add a list of allowed CORS origins for testing
    BACKEND_CORS_ORIGINS: List[str] = ["https://expense-tracker-git-master-zwetoslaw-gmailcoms-projects.vercel.app", "http://localhost:8000"]
    
    # Configuration for TestSettings
    model_config = SettingsConfigDict(
        env_file=None,  # Don't load from .env for tests
        case_sensitive=True,
        validate_default=True,
        extra="ignore"
    )


# Use the regular settings by default
settings = Settings() 