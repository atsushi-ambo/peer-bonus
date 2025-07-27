from functools import lru_cache
from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Application settings
    PROJECT_NAME: str = "Peer Bonus"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True
    # Flag to indicate testing mode; optional in env. Defaults to False.
    TESTING: bool = False
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    # Database
    POSTGRES_SERVER: str = "db"
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    DATABASE_URI: Optional[str] = None
    
    # Redis
    REDIS_URL: str = "redis://redis:6379/0"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()

# Database URL
if not settings.DATABASE_URI:
    settings.DATABASE_URI = (
        f"postgresql+asyncpg://{settings.POSTGRES_USER}:"
        f"{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_SERVER}/{settings.POSTGRES_DB}"
    )
