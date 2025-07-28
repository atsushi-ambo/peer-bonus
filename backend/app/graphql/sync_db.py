"""
Synchronous database operations for GraphQL to avoid greenlet issues.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
from app.core.config import settings

# Create a synchronous engine for GraphQL operations
sync_db_uri = settings.DATABASE_URI.replace("postgresql+asyncpg://", "postgresql://")
sync_engine = create_engine(
    sync_db_uri,  # Use psycopg2 instead of asyncpg
    echo=False,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Create synchronous session
SyncSession = sessionmaker(sync_engine, expire_on_commit=False)

@contextmanager
def get_sync_db():
    """Get a synchronous database session."""
    db = SyncSession()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()