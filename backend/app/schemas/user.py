from typing import Optional
from uuid import UUID

from pydantic import EmailStr, Field

from app.schemas.base import BaseModel, BaseModelInDB

# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    avatar_url: Optional[str] = None

# Properties to receive on user creation
class UserCreate(UserBase):
    email: EmailStr
    name: str
    password: str = Field(..., min_length=8, max_length=100)

# Properties to receive on user update
class UserUpdate(UserBase):
    password: Optional[str] = Field(None, min_length=8, max_length=100)


# Properties shared by models stored in DB
class UserInDBBase(BaseModelInDB):
    email: EmailStr
    name: str
    avatar_url: Optional[str] = None

    class Config:
        orm_mode = True

# Properties to return to client
class User(UserInDBBase):
    pass

# Properties stored in DB
class UserInDB(UserInDBBase):
    hashed_password: str
