from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.repository.user_repository import UserRepository
from app.schemas.user import UserCreate
from app.models.user import User
from app.core.security import get_password_hash


class UserService:
    def __init__(self, db: AsyncSession):
        self.user_repo = UserRepository(db)
        self.db = db

    async def create_user(self, user_data: UserCreate) -> User:
        existing_user = await self.user_repo.get_by_email(user_data.email)
        if existing_user:
            raise ValueError(f"User with email {user_data.email} already exists")
        
        hashed_password = get_password_hash(user_data.password)
        user = await self.user_repo.create_user(user_data, hashed_password)
        return user

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        return await self.user_repo.get_by_id(user_id)

    async def get_user_by_email(self, email: str) -> Optional[User]:
        return await self.user_repo.get_by_email(email)

    async def get_all_users(self, limit: int = 100, offset: int = 0) -> List[User]:
        return await self.user_repo.get_all_users(limit, offset)

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        user = await self.user_repo.get_by_email(email)
        if not user:
            return None
        
        from app.core.security import verify_password
        if not verify_password(password, user.hashed_password):
            return None
        
        return user