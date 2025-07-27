from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.kudos import Kudos
from app.repository.base_repository import BaseRepository
from app.schemas.kudos import KudosCreate, KudosUpdate

class KudosRepository(BaseRepository[Kudos, KudosCreate, KudosUpdate]):
    def __init__(self):
        super().__init__(Kudos)

    async def get_with_relations(self, db: AsyncSession, *, id: UUID) -> Optional[Kudos]:
        result = await db.execute(
            select(Kudos)
            .options(selectinload(Kudos.sender), selectinload(Kudos.receiver))
            .where(Kudos.id == id)
        )
        return result.scalar_one_or_none()

    async def get_received_kudos(
        self, db: AsyncSession, *, receiver_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Kudos]:
        result = await db.execute(
            select(Kudos)
            .options(selectinload(Kudos.sender), selectinload(Kudos.receiver))
            .where(Kudos.receiver_id == receiver_id)
            .order_by(Kudos.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_sent_kudos(
        self, db: AsyncSession, *, sender_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Kudos]:
        result = await db.execute(
            select(Kudos)
            .options(selectinload(Kudos.sender), selectinload(Kudos.receiver))
            .where(Kudos.sender_id == sender_id)
            .order_by(Kudos.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

kudos_repository = KudosRepository()
