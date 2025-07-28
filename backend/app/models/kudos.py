from typing import List, Optional, TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.reaction import Reaction

class Kudos(Base):
    __tablename__ = "kudos"
    
    # Relationships
    sender_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), 
        ForeignKey("users.id"), 
        nullable=False
    )
    receiver_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), 
        ForeignKey("users.id"), 
        nullable=False
    )
    
    # Message
    message: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Relationships
    sender: Mapped["User"] = relationship(
        "User", 
        foreign_keys=[sender_id], 
        back_populates="sent_kudos"
    )
    receiver: Mapped["User"] = relationship(
        "User", 
        foreign_keys=[receiver_id], 
        back_populates="received_kudos"
    )
    reactions: Mapped[List["Reaction"]] = relationship(
        "Reaction", 
        back_populates="kudos",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Kudos {self.id} from {self.sender_id} to {self.receiver_id}>"
