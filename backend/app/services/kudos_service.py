from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.repository.kudos_repository import KudosRepository
from app.repository.user_repository import UserRepository
from app.schemas.kudos import KudosCreate, Kudos
from app.models.kudos import Kudos as KudosModel


class KudosService:
    def __init__(self, db: AsyncSession):
        self.kudos_repo = KudosRepository(db)
        self.user_repo = UserRepository(db)
        self.db = db

    async def create_kudos(self, kudos_data: KudosCreate, sender_id: str) -> KudosModel:
        receiver = await self.user_repo.get_by_id(kudos_data.receiver_id)
        if not receiver:
            raise ValueError(f"Receiver with id {kudos_data.receiver_id} not found")
        
        kudos = await self.kudos_repo.create_kudos(kudos_data, sender_id)
        return kudos

    async def get_kudos_feed(self, limit: int = 20, offset: int = 0) -> List[KudosModel]:
        return await self.kudos_repo.get_kudos_feed(limit, offset)

    async def get_user_received_kudos(self, user_id: str, limit: int = 20, offset: int = 0) -> List[KudosModel]:
        return await self.kudos_repo.get_user_received_kudos(user_id, limit, offset)

    async def get_user_sent_kudos(self, user_id: str, limit: int = 20, offset: int = 0) -> List[KudosModel]:
        return await self.kudos_repo.get_user_sent_kudos(user_id, limit, offset)