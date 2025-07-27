from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import Field

from app.schemas.base import BaseModel, BaseModelInDB
from app.schemas.user import User

# Shared properties
class KudosBase(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)

# Properties to receive on kudos creation
class KudosCreate(KudosBase):
    sender_id: UUID
    receiver_id: UUID

# Properties to receive on kudos update
class KudosUpdate(KudosBase):
    pass

# Properties shared by models stored in DB
class KudosInDBBase(BaseModelInDB):
    sender_id: UUID
    receiver_id: UUID
    message: str

    class Config:
        orm_mode = True

# Properties to return to client
class Kudos(KudosInDBBase):
    sender: Optional[User] = None
    receiver: Optional[User] = None

# Properties stored in DB
class KudosInDB(KudosInDBBase):
    pass
