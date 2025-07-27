from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.user import User
from app.repository.base_repository import BaseRepository
from app.schemas.user import UserCreate, UserUpdate

class UserRepository(BaseRepository[User, UserCreate, UserUpdate]):
    def __init__(self):
        super().__init__(User)

    async def get_by_email(self, db: AsyncSession, *, email: str) -> Optional[User]:
        result = await db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def get_with_kudos(
        self, db: AsyncSession, *, id: UUID, include_sent: bool = True, include_received: bool = True
    ) -> Optional[User]:
        query = select(User).where(User.id == id)
        
        if include_sent:
            query = query.options(selectinload(User.sent_kudos))
        if include_received:
            query = query.options(selectinload(User.received_kudos))
        
        result = await db.execute(query)
        return result.scalar_one_or_none()

user_repository = UserRepository()
