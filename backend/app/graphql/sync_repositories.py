"""
Synchronous repository methods for GraphQL to avoid greenlet issues.
"""
from typing import List
from uuid import UUID
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select

from app.models.user import User
from app.models.kudos import Kudos


class SyncUserRepository:
    def list(self, db: Session, limit: int = 20) -> List[User]:
        """Get list of users."""
        return db.query(User).limit(limit).all()

    def get_by_id(self, db: Session, user_id: UUID) -> User:
        """Get user by ID."""
        return db.query(User).filter(User.id == user_id).first()


class SyncKudosRepository:
    def list(self, db: Session, limit: int = 100) -> List[Kudos]:
        """Get list of kudos with sender and receiver info."""
        return (
            db.query(Kudos)
            .options(joinedload(Kudos.sender), joinedload(Kudos.receiver))
            .order_by(Kudos.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_received_kudos(self, db: Session, receiver_id: UUID, limit: int = 20) -> List[Kudos]:
        """Get kudos received by a user."""
        return (
            db.query(Kudos)
            .options(joinedload(Kudos.sender), joinedload(Kudos.receiver))
            .filter(Kudos.receiver_id == receiver_id)
            .order_by(Kudos.created_at.desc())
            .limit(limit)
            .all()
        )

    def create(self, db: Session, kudos: Kudos) -> Kudos:
        """Create a new kudos."""
        db.add(kudos)
        db.flush()  # Get the ID without committing
        db.refresh(kudos)
        return kudos


sync_user_repository = SyncUserRepository()
sync_kudos_repository = SyncKudosRepository()