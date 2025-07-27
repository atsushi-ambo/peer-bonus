from datetime import datetime
from typing import Any, Dict, Generic, List, Optional, TypeVar, Union
from uuid import UUID

from pydantic import BaseModel, Field
from pydantic.generics import GenericModel

# Generic Type Vars
T = TypeVar('T')


class BaseModel(BaseModel):
    class Config:
        orm_mode = True
        json_encoders = {
            UUID: lambda v: str(v),
            datetime: lambda v: v.isoformat(),
        }

class BaseModelInDB(BaseModel):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
        json_encoders = {
            UUID: lambda v: str(v),
            datetime: lambda v: v.isoformat(),
        }

class PaginatedResponse(GenericModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    pages: int
