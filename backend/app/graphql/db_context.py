"""
Database context manager for GraphQL resolvers.
This properly handles async SQLAlchemy sessions to avoid greenlet errors.
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create a new engine specifically for GraphQL
graphql_engine = create_async_engine(
    settings.DATABASE_URI,
    echo=False,  # Don't log SQL in GraphQL context
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

# Create session factory
GraphQLSession = sessionmaker(
    graphql_engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

async def get_session():
    """Get a database session for GraphQL resolvers."""
    async with GraphQLSession() as session:
        try:
            yield session
        finally:
            await session.close()