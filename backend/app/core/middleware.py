from typing import Optional
from fastapi import Request
from strawberry.types import Info

from app.core.auth import verify_token
from app.graphql.sync_db import get_sync_db
from app.graphql.sync_repositories import sync_user_repository
from app.models.user import User


def get_current_user_from_context(info: Info) -> Optional[User]:
    """Extract current user from GraphQL context."""
    request: Request = info.context["request"]
    
    # Get authorization header
    authorization = request.headers.get("Authorization")
    if not authorization:
        return None
    
    # Extract token
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            return None
    except ValueError:
        return None
    
    # Verify token and get user
    try:
        token_data = verify_token(token)
        with get_sync_db() as db:
            user = sync_user_repository.get(db, id=token_data.user_id)
            if user and user.is_active:
                return user
    except Exception:
        pass
    
    return None


def require_authenticated_user(info: Info) -> User:
    """Require authenticated user, raise exception if not found."""
    user = get_current_user_from_context(info)
    if not user:
        raise Exception("Authentication required")
    return user