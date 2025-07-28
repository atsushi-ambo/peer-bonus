from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.kudos import Kudos

class Reaction(Base):
    __tablename__ = "reactions"
    
    # Foreign keys
    user_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), 
        ForeignKey("users.id"), 
        nullable=False
    )
    kudos_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), 
        ForeignKey("kudos.id"), 
        nullable=False
    )
    
    # Reaction type (emoji)
    reaction_type: Mapped[str] = mapped_column(String(10), nullable=False)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="reactions")
    kudos: Mapped["Kudos"] = relationship("Kudos", back_populates="reactions")
    
    # Ensure one reaction per user per kudos per type
    __table_args__ = (
        UniqueConstraint('user_id', 'kudos_id', 'reaction_type', name='uq_user_kudos_reaction'),
    )

    def __repr__(self) -> str:
        return f"<Reaction {self.id} {self.reaction_type} by {self.user_id} on {self.kudos_id}>"