import re
from typing import Optional
from uuid import UUID

from pydantic import EmailStr, Field, validator

from app.schemas.base import BaseModel, BaseModelInDB

# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    avatar_url: Optional[str] = None

# Properties to receive on user creation
class UserCreate(UserBase):
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=8, max_length=100)
    
    @validator('name')
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        # Remove potential HTML/script tags
        v = re.sub(r'<[^>]*>', '', v.strip())
        if len(v) < 1:
            raise ValueError('Name must contain at least 1 character')
        return v
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        # Check for at least one number and one letter
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[a-zA-Z]', v):
            raise ValueError('Password must contain at least one letter')
        return v

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
