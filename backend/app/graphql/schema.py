import strawberry
from typing import List, Optional
from uuid import UUID

from strawberry.fastapi import GraphQLRouter
from strawberry.types import Info

from app.db.session import get_db
from app.repository import kudos_repository, user_repository
from app.schemas import User as UserSchema, Kudos as KudosSchema, KudosCreate

@strawberry.type
class User:
    id: str
    email: str
    name: str
    avatar_url: Optional[str] = None

@strawberry.type
class Kudos:
    id: str
    sender_id: str
    receiver_id: str
    message: str
    amount: int
    created_at: str
    updated_at: str
    sender: Optional[User] = None
    receiver: Optional[User] = None

def to_user(user: UserSchema) -> User:
    return User(
        id=str(user.id),
        email=user.email,
        name=user.name,
        avatar_url=user.avatar_url
    )

def to_kudos(kudos: KudosSchema) -> Kudos:
    return Kudos(
        id=str(kudos.id),
        sender_id=str(kudos.sender_id),
        receiver_id=str(kudos.receiver_id),
        message=kudos.message,
        amount=kudos.amount,
        created_at=kudos.created_at.isoformat(),
        updated_at=kudos.updated_at.isoformat(),
        sender=to_user(kudos.sender) if kudos.sender else None,
        receiver=to_user(kudos.receiver) if kudos.receiver else None
    )

async def get_users(info: Info, limit: int = 20) -> List[User]:
    db = info.context["db"]
    users = await user_repository.list(db, limit=limit)
    return [to_user(user) for user in users]

def get_kudos_received(info: Info, user_id: UUID, limit: int = 20) -> List[Kudos]:
    db = info.context["db"]
    kudos_list = kudos_repository.get_received_kudos(db, receiver_id=user_id, limit=limit)
    return [to_kudos(kudos) for kudos in kudos_list]

async def send_kudos(
    info: Info,
    sender_id: UUID,
    receiver_id: UUID,
    message: str,
    amount: int
) -> Optional[Kudos]:
    db = info.context["db"]
    kudos_in = KudosCreate(
        sender_id=sender_id,
        receiver_id=receiver_id,
        message=message,
        amount=amount
    )
    kudos = await kudos_repository.create(db, obj_in=kudos_in)
    return to_kudos(kudos) if kudos else None

async def get_kudos_list(info: Info, limit: int = 100) -> List[Kudos]:
    db = info.context["db"]
    kudos_list = await kudos_repository.list(db, limit=limit)
    return [to_kudos(kudos) for kudos in kudos_list]

@strawberry.type
class Query:
    users: List[User] = strawberry.field(resolver=get_users)
    kudos_received: List[Kudos] = strawberry.field(resolver=get_kudos_received)
    kudos: List[Kudos] = strawberry.field(resolver=get_kudos_list)

@strawberry.type
class Mutation:
    send_kudos: Kudos = strawberry.field(resolver=send_kudos)

schema = strawberry.Schema(query=Query, mutation=Mutation)
graphql_router = GraphQLRouter(schema, context_getter=lambda: {"db": next(get_db())})
