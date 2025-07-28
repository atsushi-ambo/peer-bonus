from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field


class ReactionBase(BaseModel):
    reaction_type: str = Field(..., description="The emoji reaction type")


class ReactionCreate(ReactionBase):
    user_id: UUID = Field(..., description="ID of the user making the reaction")
    kudos_id: UUID = Field(..., description="ID of the kudos being reacted to")


class ReactionUpdate(BaseModel):
    reaction_type: Optional[str] = None


class Reaction(ReactionBase):
    id: UUID
    user_id: UUID
    kudos_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReactionSummary(BaseModel):
    """Summary of reactions for a kudos item"""
    reaction_type: str
    count: int
    user_reacted: bool = False  # Whether the current user has reacted with this type