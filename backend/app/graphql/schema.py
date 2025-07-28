import strawberry
from typing import List, Optional
from uuid import UUID

from strawberry.fastapi import GraphQLRouter
from strawberry.types import Info

from app.models.kudos import Kudos as KudosModel
from app.models.user import User as UserModel
from app.models.reaction import Reaction as ReactionModel
from app.graphql.sync_db import get_sync_db
from app.graphql.sync_repositories import sync_user_repository, sync_kudos_repository
from app.core.middleware import get_current_user_from_context, require_authenticated_user
from sqlalchemy.orm import Session
from sqlalchemy import func, text

@strawberry.type
class User:
    id: str
    email: str
    name: str
    avatar_url: Optional[str] = None

@strawberry.type
class ReactionSummary:
    reaction_type: str
    count: int
    user_reacted: bool = False
    
    @strawberry.field
    def reactionType(self) -> str:
        return self.reaction_type
    
    @strawberry.field
    def userReacted(self) -> bool:
        return self.user_reacted

@strawberry.type
class Kudos:
    id: str
    sender_id: str
    receiver_id: str
    message: str
    created_at: str
    updated_at: str
    sender: Optional[User] = None
    receiver: Optional[User] = None
    reactions: List[ReactionSummary] = strawberry.field(default_factory=list)
    
    @strawberry.field
    def createdAt(self) -> str:
        return self.created_at
    
    @strawberry.field
    def senderId(self) -> str:
        return self.sender_id
        
    @strawberry.field  
    def receiverId(self) -> str:
        return self.receiver_id

@strawberry.input
class SendKudosInput:
    receiverId: str
    message: str

@strawberry.input
class ToggleReactionInput:
    kudosId: str
    reactionType: str

def to_user(user: UserModel) -> User:
    return User(
        id=str(user.id),
        email=user.email,
        name=user.name,
        avatar_url=user.avatar_url
    )

def get_reaction_summaries(db: Session, kudos_id: UUID, user_id: Optional[UUID] = None) -> List[ReactionSummary]:
    """Get reaction summaries for a kudos with counts and user reaction status"""
    # Get count by reaction type
    reaction_counts = db.query(
        ReactionModel.reaction_type,
        func.count(ReactionModel.id).label('count')
    ).filter(
        ReactionModel.kudos_id == kudos_id
    ).group_by(ReactionModel.reaction_type).all()
    
    # Get user's reactions if user_id provided
    user_reactions = set()
    if user_id:
        user_reaction_types = db.query(ReactionModel.reaction_type).filter(
            ReactionModel.kudos_id == kudos_id,
            ReactionModel.user_id == user_id
        ).all()
        user_reactions = {r.reaction_type for r in user_reaction_types}
    
    # Always show these 4 reaction types with their counts
    default_reactions = ['❤️', '👏', '🎉', '🚀']
    reaction_map = {r.reaction_type: r.count for r in reaction_counts}
    
    summaries = []
    for reaction_type in default_reactions:
        count = reaction_map.get(reaction_type, 0)
        user_reacted = reaction_type in user_reactions
        summaries.append(ReactionSummary(
            reaction_type=reaction_type,
            count=count,
            user_reacted=user_reacted
        ))
    
    return summaries

def to_kudos(kudos: KudosModel, user_id: Optional[UUID] = None) -> Kudos:
    with get_sync_db() as db:
        reactions = get_reaction_summaries(db, kudos.id, user_id)
    
    return Kudos(
        id=str(kudos.id),
        sender_id=str(kudos.sender_id),
        receiver_id=str(kudos.receiver_id),
        message=kudos.message,
        created_at=kudos.created_at.isoformat() if kudos.created_at else "",
        updated_at=kudos.updated_at.isoformat() if kudos.updated_at else "",
        sender=to_user(kudos.sender) if kudos.sender else None,
        receiver=to_user(kudos.receiver) if kudos.receiver else None,
        reactions=reactions
    )

def get_users(info: Info, limit: int = 20) -> List[User]:
    with get_sync_db() as db:
        users = sync_user_repository.list(db, limit=limit)
        return [to_user(user) for user in users]

def get_kudos_received(info: Info, user_id: UUID, limit: int = 20) -> List[Kudos]:
    with get_sync_db() as db:
        kudos_list = sync_kudos_repository.get_received_kudos(db, receiver_id=user_id, limit=limit)
        return [to_kudos(kudos) for kudos in kudos_list]

def send_kudos(
    info: Info,
    input: SendKudosInput
) -> Optional[Kudos]:
    # Require authentication
    current_user = require_authenticated_user(info)
    
    with get_sync_db() as db:
        # Create the kudos object using authenticated user as sender
        kudos = KudosModel(
            sender_id=current_user.id,
            receiver_id=UUID(input.receiverId),
            message=input.message
        )
        created_kudos = sync_kudos_repository.create(db, kudos)
        return to_kudos(created_kudos, current_user.id)

def get_kudos_list(info: Info, limit: int = 100) -> List[Kudos]:
    # Get current user for reaction context (optional)
    current_user = get_current_user_from_context(info)
    user_id = current_user.id if current_user else None
    
    with get_sync_db() as db:
        kudos_list = sync_kudos_repository.list(db, limit=limit)
        return [to_kudos(kudos, user_id) for kudos in kudos_list]

def toggle_reaction(info: Info, input: ToggleReactionInput) -> bool:
    """Toggle a reaction - add if not exists, remove if exists"""
    # Require authentication
    current_user = require_authenticated_user(info)
    
    with get_sync_db() as db:
        kudos_id = UUID(input.kudosId)
        user_id = current_user.id
        reaction_type = input.reactionType
        
        # Check if reaction already exists
        existing_reaction = db.query(ReactionModel).filter(
            ReactionModel.kudos_id == kudos_id,
            ReactionModel.user_id == user_id,
            ReactionModel.reaction_type == reaction_type
        ).first()
        
        if existing_reaction:
            # Remove reaction
            db.delete(existing_reaction)
            db.commit()
            return False  # Removed
        else:
            # Add reaction
            new_reaction = ReactionModel(
                kudos_id=kudos_id,
                user_id=user_id,
                reaction_type=reaction_type
            )
            db.add(new_reaction)
            db.commit()
            return True  # Added

@strawberry.type
class Query:
    users: List[User] = strawberry.field(resolver=get_users)
    kudos_received: List[Kudos] = strawberry.field(resolver=get_kudos_received)
    kudos: List[Kudos] = strawberry.field(resolver=get_kudos_list)

@strawberry.type
class Mutation:
    send_kudos: Kudos = strawberry.field(resolver=send_kudos)
    toggle_reaction: bool = strawberry.field(resolver=toggle_reaction)
    
    @strawberry.field
    def toggleReaction(self, input: ToggleReactionInput) -> bool:
        return toggle_reaction(None, input)

def get_context(request, response=None):
    return {"request": request, "response": response}

schema = strawberry.Schema(query=Query, mutation=Mutation)
graphql_router = GraphQLRouter(schema, context_getter=get_context)
