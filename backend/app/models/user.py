from typing import List, Optional, TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.kudos import Kudos

class User(Base):
    __tablename__ = "users"


    # User information
    email: Mapped[str] = mapped_column(
        String(255), 
        unique=True, 
        index=True, 
        nullable=False
    )
    name: Mapped[str] = mapped_column(
        String(255), 
        nullable=False
    )
    avatar_url: Mapped[Optional[str]] = mapped_column(
        String(512), 
        nullable=True
    )
    
    # Relationships
    sent_kudos: Mapped[List["Kudos"]] = relationship(
        "Kudos", 
        back_populates="sender", 
        foreign_keys="Kudos.sender_id"
    )
    received_kudos: Mapped[List["Kudos"]] = relationship(
        "Kudos", 
        back_populates="receiver", 
        foreign_keys="Kudos.receiver_id"
    )

    def __repr__(self) -> str:
        return f"<User {self.email}>"
